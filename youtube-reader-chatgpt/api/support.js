export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YouTube Reader Support</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:760px;margin:48px auto;padding:0 20px;line-height:1.6">
<h1>YouTube Reader Support</h1>
<p>YouTube Reader is a free, read-only service that retrieves public YouTube transcripts for ChatGPT /read workflows.</p>
<h2>Common issues</h2>
<ul><li><strong>Transcript unavailable:</strong> the video may be private, deleted, restricted, or have no accessible captions.</li><li><strong>Incomplete transcript:</strong> retry with another caption language when available.</li><li><strong>No account required:</strong> YouTube Reader does not require user sign-in and does not store transcripts.</li></ul>
<h2>Report a problem</h2>
<p>Open an issue in the public repository: <a href="https://github.com/vkentony1/knowledge-work-plugins/issues">GitHub Issues</a>.</p>
<p><a href="/">Home</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
</body></html>`);
}
