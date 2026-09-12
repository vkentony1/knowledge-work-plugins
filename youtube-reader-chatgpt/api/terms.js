export default function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.status(200).send('Use YouTube Reader only for lawful access to publicly available transcript data. Users remain responsible for copyright, platform terms, and downstream use. No warranty of transcript availability or accuracy is provided.');
}
