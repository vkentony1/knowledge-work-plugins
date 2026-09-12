const MCP_ENDPOINT = 'https://youtube-transcript.ai/mcp';
const TXT_BASE = 'https://youtube-transcript.ai/transcript';

let nextId = 1;

export function extractVideoId(input) {
  const value = String(input || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(id || '')) return id;
    }
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      const queryId = url.searchParams.get('v');
      if (/^[A-Za-z0-9_-]{11}$/.test(queryId || '')) return queryId;
      const parts = url.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live'].includes(parts[0]) && /^[A-Za-z0-9_-]{11}$/.test(parts[1] || '')) {
        return parts[1];
      }
    }
  } catch {
    // Fall through to the explicit invalid-input error below.
  }

  throw new Error('Invalid YouTube URL or video ID');
}

async function fetchDirectTranscript(video) {
  const id = extractVideoId(video);
  const res = await fetch(`${TXT_BASE}/${id}.txt`, {
    headers: {
      Accept: 'text/plain, text/*;q=0.9, */*;q=0.1',
      'User-Agent': 'youtube-reader-chatgpt/1.0'
    }
  });
  if (!res.ok) throw new Error(`Direct transcript HTTP ${res.status}`);
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.length < 100) throw new Error('Direct transcript response is empty or too short');
  if (/^<!doctype html|^<html/i.test(trimmed)) throw new Error('Direct transcript returned HTML instead of transcript text');
  return trimmed;
}

async function rpc(method, params) {
  const res = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params })
  });
  if (!res.ok) throw new Error(`Upstream MCP HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'Upstream MCP error');
  return json.result;
}

async function fetchMcpTranscript(video, lang) {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'youtube-reader-chatgpt', version: '1.0.4' }
  });
  const out = await rpc('tools/call', {
    name: 'get_youtube_transcript',
    arguments: { video, ...(lang ? { lang } : {}) }
  });
  const text = (out.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('\n');
  if (out.isError || !text.trim()) throw new Error(text || 'Transcript unavailable');
  return text;
}

export async function fetchTranscript(video, lang) {
  // The provider documents the direct .txt endpoint as a free, keyless transcript
  // optimized for agents. Prefer it for the default-language path because it is
  // simpler and preserves paragraph timestamps like [m:ss].
  if (!lang) {
    try {
      return await fetchDirectTranscript(video);
    } catch (directError) {
      try {
        return await fetchMcpTranscript(video, undefined);
      } catch (mcpError) {
        throw new Error(`Direct transcript failed: ${directError.message}; MCP fallback failed: ${mcpError.message}`);
      }
    }
  }

  // Explicit language selection stays on MCP until the direct endpoint documents
  // an equivalent language selector.
  return fetchMcpTranscript(video, lang);
}
