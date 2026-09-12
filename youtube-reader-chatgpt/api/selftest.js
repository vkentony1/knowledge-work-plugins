import { fetchTranscript } from '../lib/upstream.js';
import { analyzeTranscript } from '../lib/validate.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  const video = url.searchParams.get('video');
  const lang = url.searchParams.get('lang') || undefined;
  res.setHeader('cache-control', 'no-store');
  if (!video) {
    res.status(400).json({ ok: false, error: 'Missing video query parameter' });
    return;
  }
  try {
    const transcript = await fetchTranscript(video, lang);
    res.status(200).json({
      ok: true,
      source: 'public_youtube_captions',
      video,
      language_requested: lang ?? null,
      qa: analyzeTranscript(transcript)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(502).json({ ok: false, error: `Transcript unavailable: ${message}` });
  }
}
