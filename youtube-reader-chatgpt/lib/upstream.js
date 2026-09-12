const ENDPOINT = 'https://youtube-transcript.ai/mcp';

let nextId = 1;

async function rpc(method, params) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params })
  });
  if (!res.ok) throw new Error(`Upstream HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'Upstream MCP error');
  return json.result;
}

export async function fetchTranscript(video, lang) {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'youtube-reader-chatgpt', version: '1.0.0' }
  });
  const out = await rpc('tools/call', {
    name: 'get_youtube_transcript',
    arguments: { video, ...(lang ? { lang } : {}) }
  });
  const text = (out.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('\n');
  if (out.isError || !text.trim()) throw new Error(text || 'Transcript unavailable');
  return text;
}
