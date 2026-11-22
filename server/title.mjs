export async function getVideoTitle(id) {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const info = await response.json();
      if (typeof info.title === 'string' && info.title.trim()) return info.title;
    }
  } catch { /* Metadata failure must not discard a completed conversion. */ }
  return id;
}

export function downloadFilename(title, id) {
  let name = Array.from((typeof title === 'string' ? title : id).toWellFormed().normalize('NFC')
    .replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, '_').trim()).slice(0, 150).join('').replace(/[. ]+$/, '') || id;
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) name = `_${name}`;
  return `${name}.mp3`;
}
