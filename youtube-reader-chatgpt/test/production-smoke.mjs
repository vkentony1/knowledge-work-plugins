import assert from 'node:assert/strict';

const endpoint = process.env.YOUTUBE_READER_MCP_URL || 'https://youtube-reader-chatgpt.vercel.app/mcp';
let sessionId = null;
let id = 1;

function parseMcpBody(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);
  if (!dataLines.length) throw new Error(`Unrecognized MCP response: ${trimmed.slice(0, 200)}`);
  return JSON.parse(dataLines.at(-1));
}

async function rpc(method, params = {}) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream'
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, method, params })
  });
  assert.equal(res.ok, true, `${method} HTTP ${res.status}`);
  sessionId = res.headers.get('mcp-session-id') || sessionId;
  const body = parseMcpBody(await res.text());
  assert.ok(body, `${method} returned empty body`);
  assert.equal(body.error, undefined, `${method} returned MCP error: ${JSON.stringify(body.error)}`);
  return body.result;
}

const initialized = await rpc('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'youtube-reader-production-smoke', version: '1.0.0' }
});
assert.equal(initialized.serverInfo?.name, 'youtube-reader');

const listed = await rpc('tools/list');
assert.ok(Array.isArray(listed.tools));
assert.ok(listed.tools.some((tool) => tool.name === 'read_youtube_transcript'));

const called = await rpc('tools/call', {
  name: 'read_youtube_transcript',
  arguments: { video: 'sWj6-eR4XF0', include_qa: true }
});
assert.notEqual(called.isError, true, 'tool call returned isError');
const textPart = (called.content || []).find((item) => item.type === 'text')?.text;
assert.ok(textPart, 'tool call missing text payload');
const payload = JSON.parse(textPart);
assert.equal(payload.qa?.qa_status, 'PASS');
assert.equal(payload.qa?.starts_near_zero, true);
assert.ok((payload.qa?.timestamp_count || 0) >= 20);
assert.ok((payload.qa?.last_timestamp_seconds || 0) >= 2600);
assert.equal(payload.qa?.suspicious_duplicates, false);
assert.ok((payload.transcript || '').length > 1000);

console.log(JSON.stringify({
  ok: true,
  endpoint,
  tool: 'read_youtube_transcript',
  qa_status: payload.qa.qa_status,
  timestamp_count: payload.qa.timestamp_count,
  first_timestamp: payload.qa.first_timestamp,
  last_timestamp: payload.qa.last_timestamp
}));
