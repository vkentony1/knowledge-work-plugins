export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.status(200).send('YouTube Reader is read-only. It receives a YouTube URL or video ID, requests publicly available transcript data, returns it to the requesting client, and does not intentionally persist transcript content or user prompts.');
}
