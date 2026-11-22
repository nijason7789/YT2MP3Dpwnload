# Render deployment

## Backend (Free Web Service)

Production flow: frontend -> Render `/convert` -> RapidAPI audio request -> M4A download on Render -> FFmpeg -> MP3 response. The browser never contacts RapidAPI or the M4A download host.

### Switch the existing yt-dlp experiment service

For the existing `yt2mp3dpwnload.onrender.com` service, change **Settings > Build & Deploy > Dockerfile Path** from `./Dockerfile.ytdlp` to **`./Dockerfile`**. Leave the Docker command override empty so the image starts `server/index.mjs`. Set `RAPIDAPI_KEY` and `ALLOWED_ORIGINS` in Environment, then deploy the updated commit. Use a rotated key; do not paste it into chat. `/health` returns `ready: false` when the backend key is missing. This replaces the direct YouTube download path for that service without changing its URL.

The frontend build must have `VITE_API_BASE_URL=https://yt2mp3dpwnload.onrender.com` (or the actual service URL). Rebuild the frontend after setting it. A health check never uses RapidAPI quota. Conversion does: review the subscription's remaining quota/overage rules before making real requests. Automated tests use mock provider responses and consume no quota.

### Create a new service instead

1. Push this repository, including `Dockerfile`, `server/`, and `render.yaml`, to GitHub.
2. In Render choose **New > Blueprint**, connect the repository, and use `render.yaml`. Alternatively create a **Web Service**, choose **Docker**, repository root as root directory, and the **Free** instance type. Do not select Static Site for the backend.
3. Set these server environment variables:
   - `RAPIDAPI_KEY`: a fresh RapidAPI key subscribed to the Opachi YouTube MP4/MP3 Downloader API. This is NOT a `VITE_` variable.
   - `ALLOWED_ORIGINS`: comma-separated frontend origins, e.g. `https://nijason7789.github.io,http://localhost:3000`. No trailing slash or `/YT2MP3Dpwnload/` path. Add your Cloudflare Pages origin if applicable.
4. Set health check path to `/health` if using manual service creation. Deploy and copy the `https://...onrender.com` service URL.
5. Open `/health`; expect `{"ready":true}`. Render may need about a minute to wake after inactivity.

Choose the Free instance and do not add a payment method if you want included bandwidth exhaustion to suspend service rather than incur supplementary bandwidth charges. Check the current Render billing rules in your dashboard. RapidAPI has its own independent subscription and quotas.

## Frontend

Environment variable placement:

| Name | Location | Secret? |
| --- | --- | --- |
| `RAPIDAPI_KEY` | Render service > Environment | Yes: backend only, never commit or prefix with `VITE_` |
| `ALLOWED_ORIGINS` | Render service > Environment | No: the frontend origins permitted by CORS |
| `VITE_API_BASE_URL` | Frontend build environment (GitHub Actions repository Variables) | No: the public Render backend URL, not an API key |

Set `VITE_API_BASE_URL` to the Render service URL, without a trailing path.

- GitHub Actions: repository **Settings > Secrets and variables > Actions > Variables**, create `VITE_API_BASE_URL`. The existing workflow builds GitHub Pages from this variable. Automatic deployment is skipped while it is empty, so the initial code push does not deploy an unconfigured frontend.
- Cloudflare Pages or other Vite hosting: set the same build environment variable. For domain-root hosting set `VITE_BASE_PATH=/`; the default production base is the existing `/YT2MP3Dpwnload/` GitHub Pages path.
- Local: add `VITE_API_BASE_URL=http://localhost:10000` to `.env`, then run `npm run dev`.

Rebuild and deploy the frontend after setting the URL. Remove the old `VITE_RAPIDAPI_KEY` from frontend build secrets/environment variables; it is no longer used or included in the frontend bundle. Rotate any key previously exposed in the browser or chat.

The page sends `/health` on load to wake the backend. Submitting a URL waits for readiness automatically before posting `/convert`, then downloads the MP3 as a local Blob. Initial startup can take about a minute, and conversion takes additional time. Wake checks retry; conversion requests do not automatically retry to avoid duplicate quota consumption.

Downloads use the YouTube video title as the filename. After converting, the backend fetches public YouTube oEmbed metadata (no RapidAPI request), sanitizes unsafe filename characters, and sends a UTF-8 `Content-Disposition` filename exposed through CORS. The frontend preserves that name when downloading the Blob. If metadata is unavailable within five seconds, the video ID is used instead. Redeploy both backend and frontend for this feature.

## Limits and operational behavior

- Request bodies are capped at 2 KiB and must finish uploading within 10 seconds.
- One conversion at a time; additional requests receive HTTP 429. Global limit: 10 accepted conversion attempts per hour per process.
- This is a lightweight limit, not authentication. It resets on restart and is not shared between instances. CORS is a browser restriction, not protection against scripted API calls. Use persistent quotas and authentication before broader public release.
- Input download is capped at 40 MiB. FFprobe verifies duration **after downloading**, before transcoding. Unknown durations and audio longer than 600 seconds are rejected; exactly 600 seconds is allowed. This enforces actual downloaded audio duration, not source metadata before API usage.
- Provider polling is bounded to 18 status requests at five-second intervals (at most 85 seconds of waits); API calls and downloading share a 150-second deadline, probing 15 seconds, encoding 60 seconds. An immediately completed create response skips status polling. Output is 128 kbps MP3. No paid provider MP3 conversion is requested. Provider failures stop the request without automatic retries.
- Temporary files are removed after each operation, including failure. Downloads are returned directly, so no database or persistent disk is required. Restarting Render during a conversion interrupts the request; the user must retry.
- Render Free may suspend services that initiate unusually high external traffic. Free hosting is best treated as a trial for this use case.

## Local backend and verification

Install Node.js 22+, FFmpeg and FFprobe on PATH. Set `RAPIDAPI_KEY` and `ALLOWED_ORIGINS` in the process environment, then run `npm run start:server`. Backend startup does not read frontend `.env` automatically.

```sh
npm test -- --runInBand
npm run test:server
# Also run the real transcoding check when ffmpeg/ffprobe are on PATH:
TEST_FFMPEG=1 npm run test:server
```

Or build and run the Docker container with the two backend variables supplied at runtime. Docker build context excludes `.env`, Git history, test media, and frontend files.

## Deployment smoke check

1. Open the frontend after the backend has slept; verify the startup message and automatic continuation.
2. Convert a short permitted test video; download and play the MP3.
3. Test a video longer than 10 minutes; expect the duration rejection, not truncated output.
4. Test simultaneous requests; expect the busy message and no second conversion.

References: https://render.com/docs/free and https://render.com/docs/blueprint-spec

## Direct yt-dlp experiment (no RapidAPI usage)

This is a separate experiment: the existing Dockerfile and Render service still use RapidAPI. The experiment uses `Dockerfile.ytdlp` and `server/ytdlp.mjs`, with yt-dlp 2026.10.26, its EJS dependency, Node.js as the JavaScript runtime, and FFmpeg. No API key, cookies, login, or paid proxy is required. Local Docker testing successfully downloaded `jNQXAC9IVRw` and produced a valid MP3; this does not prove Render's cloud IP works.

### Deploy the experiment to Render

1. Push the experimental files to GitHub. Create a separate **Free Web Service**, with **Docker** runtime, root directory left blank, and Dockerfile path **`./Dockerfile.ytdlp`**. Alternatively use a Blueprint with file path **`render-ytdlp.yaml`**.
2. Set only `ALLOWED_ORIGINS` to your frontend origin(s), without a URL path. Do not set `RAPIDAPI_KEY` for this service. Use `/health` as the health check.
3. After deploying, open `https://YOUR-SERVICE.onrender.com/health`. Expect `{"ready":true}`. This confirms startup, not YouTube access.
4. In PowerShell, test the actual server (replace the URL):

```powershell
Invoke-WebRequest -UseBasicParsing -Uri 'https://YOUR-SERVICE.onrender.com/convert' -Method Post -ContentType 'application/json' -Body '{"id":"jNQXAC9IVRw"}' -OutFile 'render-direct-test.mp3' -TimeoutSec 240
```

5. Confirm a successful response and play the file. If YouTube blocks the host, inspect Render logs. The response will report that direct downloading is unavailable; do not assume restarting or adding authentication cookies makes this dependable.
6. Only after this test succeeds, point `VITE_API_BASE_URL` to the experimental service and rebuild the frontend. Keep the old frontend URL configuration until then.

The experiment checks metadata before downloading (rejects unknown duration, live streams, and videos longer than 600 seconds), then uses FFprobe to check the downloaded audio again. Metadata extraction has a 45-second timeout, downloading 90 seconds, and the existing probe/transcoding timeouts still apply. `--max-filesize 40M` is a best-effort download limit when the source exposes a size; a final file-size check also rejects oversized downloads. Existing hourly/concurrency limits apply and still reset on restart. This is not a guarantee against abuse or YouTube IP blocking.

To reproduce locally:

```sh
docker build -f Dockerfile.ytdlp -t yt2mp3-direct:experiment .
docker run --rm -e TEST_FFMPEG=1 yt2mp3-direct:experiment node --test server/server.test.mjs server/ytdlp.test.mjs
docker run --rm -p 127.0.0.1:10001:10000 -e ALLOWED_ORIGINS=http://localhost:3000 yt2mp3-direct:experiment
```

When YouTube compatibility breaks, review the official yt-dlp release notes, update the Docker build argument version, rebuild and re-test. Official reference: https://github.com/yt-dlp/yt-dlp
