# YT2MP3 Converter

React + TypeScript frontend with a small Node.js/FFmpeg backend for Render.

The backend uses RapidAPI v2 to obtain audio (Basic-compatible `type: "audio"`), validates its duration, and transcodes locally to 128 kbps MP3. Videos must be no longer than 10 minutes. The RapidAPI key stays on the backend.

## Development

```sh
npm ci
npm run dev
npm test -- --runInBand
npm run test:server
npm run build
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend URL. Backend setup, environment variables, Render deployment and current limitations are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

The frontend wakes a sleeping backend when the page opens and waits automatically on submission. Render Free startup can take about a minute. Rendering the frontend remains independent of backend startup.

Only download content you have permission to use.
