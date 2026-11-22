import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVideoTitle, downloadFilename } from './title.mjs';

test('preserves Unicode titles and removes unsafe filename characters', () => {
  assert.equal(downloadFilename('中文歌曲 🎵', 'id'), '中文歌曲 🎵.mp3');
  assert.equal(downloadFilename('Song: A/B\r\n"test"? ', 'id'), 'Song_ A_B___test__.mp3');
  assert.equal(downloadFilename('CON', 'id'), '_CON.mp3');
  assert.equal(downloadFilename(' ... ', 'id'), 'id.mp3');
});

test('reads title from public metadata without any API key', async t => {
  const request = t.mock.method(globalThis, 'fetch', async () => Response.json({ title: '中文歌曲 🎵' }));
  assert.equal(await getVideoTitle('jNQXAC9IVRw'), '中文歌曲 🎵');
  const [url, options] = request.mock.calls[0].arguments;
  assert.equal(new URL(url).hostname, 'www.youtube.com');
  assert.equal(options.headers, undefined);
});

test('metadata errors fall back to video ID', async t => {
  const request = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 429 }));
  assert.equal(await getVideoTitle('jNQXAC9IVRw'), 'jNQXAC9IVRw');
  request.mock.mockImplementation(async () => { throw new Error('timeout'); });
  assert.equal(await getVideoTitle('jNQXAC9IVRw'), 'jNQXAC9IVRw');
});
