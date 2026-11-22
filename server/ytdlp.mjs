import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { checkDuration, transcode } from './convert.mjs';
import { createApp } from './index.mjs';

const exec = promisify(execFile);
const COMMON = ['--ignore-config', '--no-playlist', '--no-cache-dir', '--js-runtimes', 'node', '--socket-timeout', '15', '--retries', '1', '--fragment-retries', '1'];

export function checkVideo(info) {
  if (info.is_live || info.live_status === 'is_live') throw new Error('Live streams are not supported.');
  checkDuration(info.duration);
}

export async function convertYouTube(id, _key, run = exec) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) throw new Error('Invalid YouTube video ID.');
  const url = `https://www.youtube.com/watch?v=${id}`;
  const directory = await mkdtemp(join(tmpdir(), 'yt2mp3-direct-'));
  try {
    const { stdout } = await run('yt-dlp', [...COMMON, '--dump-single-json', '--skip-download', '--', url], { timeout: 45000, maxBuffer: 8 * 1024 * 1024 });
    const info = JSON.parse(stdout);
    checkVideo(info);
    const input = join(directory, 'input.audio');
    const output = join(directory, 'audio.mp3');
    await run('yt-dlp', [...COMMON, '-f', 'bestaudio', '--max-filesize', '40M', '--no-progress', '-o', input, '--', url], { timeout: 90000, maxBuffer: 1024 * 1024 });
    if ((await stat(input)).size > 40 * 1024 * 1024) throw new Error('Audio file is too large.');
    await transcode(input, output);
    return await readFile(output);
  } catch (error) {
    if (error.stderr) {
      // Do not return signed media URLs or subprocess internals to website visitors.
      const blocked = /sign in|not a bot|HTTP Error 403|HTTP Error 429/i.test(error.stderr);
      console.error('yt-dlp failed:', error.stderr.slice(-2000));
      throw new Error(blocked ? 'YouTube blocked this server. Direct downloading is unavailable.' : 'Direct audio download failed. Check the server logs.');
    }
    throw error;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp({ requiresKey: false, convert: convertYouTube }).listen(Number(process.env.PORT || 10000), '0.0.0.0');
}
