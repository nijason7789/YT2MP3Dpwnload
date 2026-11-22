import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const exec = promisify(execFile);
const HOST = 'youtube-mp4-mp3-downloader.p.rapidapi.com';
const MAX_BYTES = 40 * 1024 * 1024;

export function checkDuration(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('Unable to verify audio duration.');
  if (seconds > 600) throw new Error('Please use a video no longer than 10 minutes.');
}

export function checkDownloadUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !/^dl\d*\.ytdwn\.site$/.test(url.hostname) || url.port || url.username || url.password) {
    throw new Error('Unexpected download server.');
  }
  return url;
}

export async function transcode(input, output) {
  const { stdout } = await exec('ffprobe', ['-v', 'error', '-protocol_whitelist', 'file,pipe', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', input], { timeout: 15000 });
  checkDuration(stdout.trim());
  await exec('ffmpeg', ['-nostdin', '-v', 'error', '-protocol_whitelist', 'file,pipe', '-i', input, '-map', '0:a:0', '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', '-y', output], { timeout: 60000 });
}

export async function convertAudio(id, key) {
  const signal = AbortSignal.timeout(150000);
  const api = async (path, body) => {
    const response = await fetch(`https://${HOST}${path}`, {
      method: body ? 'POST' : 'GET', signal,
      headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': HOST, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.message || data.error || 'Audio provider request failed.');
    return data;
  };
  const job = await api('/api/v2/request', { id, type: 'audio' });
  if (typeof job.uid !== 'string' || !job.uid) throw new Error('Audio provider did not return a request ID.');
  let downloadUrl;
  for (let i = 0; i < 45; i++) {
    const status = await api(`/api/v2/request/status?uid=${encodeURIComponent(job.uid)}`);
    if (status.state === 'FINISH' && status.downloadUrl) { downloadUrl = status.downloadUrl; break; }
    if (['FAILED', 'ERROR'].includes(status.state)) throw new Error(status.message || 'Audio preparation failed.');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  if (!downloadUrl) throw new Error('Audio preparation timed out. Please try again later.');
  const response = await fetch(checkDownloadUrl(downloadUrl), { signal, redirect: 'error' });
  if (!response.ok || !response.body) throw new Error('Unable to download the prepared audio.');
  if (Number(response.headers.get('content-length')) > MAX_BYTES) {
    await response.body.cancel();
    throw new Error('Audio file is too large. Please use a shorter video.');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error('Audio file is too large. Please use a shorter video.');
    chunks.push(chunk);
  }
  const directory = await mkdtemp(join(tmpdir(), 'yt2mp3-'));
  try {
    const input = join(directory, 'input.audio');
    const output = join(directory, 'audio.mp3');
    await writeFile(input, Buffer.concat(chunks));
    await transcode(input, output);
    return await readFile(output);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
