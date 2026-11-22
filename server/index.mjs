import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { convertAudio } from './convert.mjs';

export function createApp({ key = process.env.RAPIDAPI_KEY, origins = process.env.ALLOWED_ORIGINS || '', convert = convertAudio, requiresKey = true } = {}) {
  const allowed = new Set(origins.split(',').map(value => value.trim()).filter(Boolean));
  let busy = false;
  let attempts = [];
  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Origin');
    const json = (status, error) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error })); };
    if (origin && !allowed.has(origin)) return json(403, 'This website is not allowed.');
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ready: !requiresKey || Boolean(key) }));
    }
    if (req.method !== 'POST' || req.url !== '/convert') return json(404, 'Not found.');
    if (requiresKey && !key) return json(503, 'The server API key is not configured.');
    if (busy) return json(429, 'Another conversion is running. Please try again shortly.');
    attempts = attempts.filter(time => time > Date.now() - 3600000);
    // shortcut: per-instance hourly limit resets on restart; add persistent quotas before wider public use.
    if (attempts.length >= 10) return json(429, 'Hourly conversion limit reached. Please try again later.');
    busy = true;
    const bodyTimer = setTimeout(() => req.destroy(), 10000);
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
        if (body.length > 2048) return json(413, 'Request too large.');
      }
      clearTimeout(bodyTimer);
      let data;
      try { data = JSON.parse(body); } catch { return json(400, 'Invalid JSON request.'); }
      if (!data || typeof data.id !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(data.id)) return json(400, 'Invalid YouTube video ID.');
      attempts.push(Date.now());
      const mp3 = await convert(data.id, key);
      if (res.destroyed) return;
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Disposition': 'attachment; filename="audio.mp3"', 'Content-Length': mp3.length });
      res.end(mp3);
    } catch (error) {
      if (!res.destroyed) json(422, error.message || 'Conversion failed.');
    } finally {
      clearTimeout(bodyTimer);
      busy = false;
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp().listen(Number(process.env.PORT || 10000), '0.0.0.0');
}
