import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './index.mjs';
import { checkDuration, checkDownloadUrl, transcode } from './convert.mjs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
test('duration must be known and at most 600 seconds', () => {
  checkDuration('600');
  for (const value of ['601', 'NaN', '', '-1']) assert.throws(() => checkDuration(value));
});
test('download URL cannot target arbitrary servers', () => {
  checkDownloadUrl('https://dl2.ytdwn.site/file');
  for (const url of ['http://dl.ytdwn.site/', 'https://127.0.0.1/', 'https://dl.ytdwn.site.evil.test/', 'https://user@dl.ytdwn.site/']) assert.throws(() => checkDownloadUrl(url));
});
test('HTTP validates origin, ID, concurrency and hourly quota', async () => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  let calls = 0;
  const app = createApp({ getTitle: async () => '中文歌曲 🎵', key: 'test', origins: 'https://site.test', convert: async () => { calls++; if (calls === 1) await pending; return Buffer.from('mp3'); } });
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  const base = `http://127.0.0.1:${app.address().port}`;
  const post = (id = 'jNQXAC9IVRw', origin = 'https://site.test') => fetch(`${base}/convert`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  try {
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.equal((await post('invalid')).status, 400);
    assert.equal((await post(undefined, 'https://evil.test')).status, 403);
    const first = post();
    while (!calls) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal((await post()).status, 429);
    release();
    const r = await first;
    assert.equal(r.headers.get('content-type'), 'audio/mpeg');
    assert.equal(r.headers.get('access-control-expose-headers'), 'Content-Disposition');
    assert.match(r.headers.get('content-disposition'), /filename\*=UTF-8''/);
    assert.equal(decodeURIComponent(r.headers.get('content-disposition').split("UTF-8''")[1]), '中文歌曲 🎵.mp3');
    assert.equal(await r.text(), 'mp3');
    for (let i = 0; i < 9; i++) assert.equal((await post()).status, 200);
    assert.equal((await post()).status, 429);
  } finally { release(); app.closeAllConnections(); await new Promise(resolve => app.close(resolve)); }
});
test('real FFmpeg converts generated audio to MP3', { skip: !process.env.TEST_FFMPEG }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'yt2mp3-test-'));
  try {
    const input = join(dir, 'test.m4a');
    const output = join(dir, 'test.mp3');
    await promisify(execFile)('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-y', input]);
    await transcode(input, output);
    const data = await readFile(output);
    assert.ok(data.length > 1000);
    assert.equal(data.subarray(0, 3).toString(), 'ID3');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
