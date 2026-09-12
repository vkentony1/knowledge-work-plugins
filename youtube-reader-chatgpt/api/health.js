export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  res.status(200).json({ ok: true, service: 'youtube-reader', version: '1.0.5' });
}
