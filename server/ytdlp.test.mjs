import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkVideo, convertYouTube } from './ytdlp.mjs';
import { createApp } from './index.mjs';
import { once } from 'node:events';

test('direct download rejects long, live, and unknown-duration videos before downloading', async () => {
  checkVideo({ duration: 600 });
  for (const info of [{ duration: 601 }, { duration: null }, { duration: 10, is_live: true }]) {
    let calls = 0;
    await assert.rejects(convertYouTube('jNQXAC9IVRw', undefined, async () => { calls++; return { stdout: JSON.stringify(info) }; }));
    assert.equal(calls, 1);
  }
});
test('direct download accepts only a video ID', async () => {
  await assert.rejects(convertYouTube('https://evil.test'), /Invalid YouTube/);
});

test('experimental server is ready and converts without a RapidAPI key', async () => {
  const app = createApp({ getTitle: async () => '???? ??', key: '', requiresKey: false, convert: async () => Buffer.from('mp3') });
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  const base = `http://127.0.0.1:${app.address().port}`;
  try {
    assert.deepEqual(await (await fetch(`${base}/health`)).json(), { ready: true });
    const response = await fetch(`${base}/convert`, { method: 'POST', body: JSON.stringify({ id: 'jNQXAC9IVRw' }) });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'mp3');
  } finally { app.closeAllConnections(); await new Promise(resolve => app.close(resolve)); }
});
