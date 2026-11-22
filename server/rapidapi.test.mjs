import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { convertAudio } from './convert.mjs';

test('invalid input and missing key never contact RapidAPI', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network request'); });
  await assert.rejects(convertAudio('invalid', 'key'), /Invalid YouTube/);
  await assert.rejects(convertAudio('jNQXAC9IVRw', ''), /not configured/);
  assert.equal(fetch.mock.callCount(), 0);
});

test('provider quota rejection stops immediately without retrying', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Monthly quota exceeded' }, { status: 429 }));
  await assert.rejects(convertAudio('jNQXAC9IVRw', 'test-key'), /Monthly quota exceeded/);
  assert.equal(fetch.mock.callCount(), 1);
});

test('unexpected media host is rejected before downloading', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return Response.json(calls === 1 ? { uid: 'job' } : { state: 'FINISH', downloadUrl: 'https://evil.test/audio' });
  });
  await assert.rejects(convertAudio('jNQXAC9IVRw', 'test-key'), /Unexpected download server/);
  assert.equal(calls, 2);
});

test('failed create response does not spend quota on status polling', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ uid: 'job', state: 'FAILED', message: 'Video unavailable' }));
  await assert.rejects(convertAudio('jNQXAC9IVRw', 'test-key'), /Video unavailable/);
  assert.equal(fetch.mock.callCount(), 1);
});

test('completed create response skips status polling', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ uid: 'job', state: 'FINISH', downloadUrl: 'https://evil.test/audio' }));
  await assert.rejects(convertAudio('jNQXAC9IVRw', 'test-key'), /Unexpected download server/);
  assert.equal(fetch.mock.callCount(), 1);
});

test('quota rejection during polling stops without retrying', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return calls === 1 ? Response.json({ uid: 'job' }) : Response.json({ message: 'Quota exceeded' }, { status: 429 });
  });
  await assert.rejects(convertAudio('jNQXAC9IVRw', 'test-key'), /Quota exceeded/);
  assert.equal(calls, 2);
});

test('mock provider M4A is transcoded into real MP3 without any network', { skip: !process.env.TEST_FFMPEG }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'yt2mp3-provider-test-'));
  try {
    const fixture = join(directory, 'fixture.m4a');
    await promisify(execFile)('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-y', fixture]);
    const audio = await readFile(fixture);
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      requests.push({ url: String(url), options });
      if (requests.length === 1) return Response.json({ uid: 'test-job', state: 'IN_QUEUE' });
      if (requests.length === 2) return Response.json({ state: 'FINISH', downloadUrl: 'https://dl.ytdwn.site/audio' });
      if (requests.length === 3) return new Response(audio, { headers: { 'Content-Type': 'audio/mp4' } });
      throw new Error('Unexpected request');
    });
    const mp3 = await convertAudio('jNQXAC9IVRw', 'server-only-key');
    assert.equal(mp3.subarray(0, 3).toString(), 'ID3');
    assert.ok(mp3.length > 1000);
    assert.deepEqual(JSON.parse(requests[0].options.body), { id: 'jNQXAC9IVRw', type: 'audio' });
    assert.equal(requests[0].options.headers['x-rapidapi-key'], 'server-only-key');
    assert.match(requests[1].url, /\/api\/v2\/request\/status\?uid=test-job$/);
    assert.equal(requests[2].options.headers, undefined);
    assert.equal(requests[2].options.redirect, 'error');
    assert.equal(requests.length, 3);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
