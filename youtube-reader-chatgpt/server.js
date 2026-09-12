import { createServer } from 'node:http';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import { fetchTranscript } from './lib/upstream.js';
import { analyzeTranscript } from './lib/validate.js';

function buildServer() {
  const server = new McpServer(
    { name: 'youtube-reader', version: '1.0.1' },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    'read_youtube_transcript',
    {
      title: 'Read YouTube transcript',
      description: 'Fetch a public YouTube transcript for reading, summarization, translation, fact-checking, and /read workflows. Read-only; does not modify YouTube or store transcripts.',
      inputSchema: z.object({
        video: z.string().min(1).describe('YouTube URL or 11-character video ID'),
        lang: z.string().min(2).optional().describe('Optional BCP-47 caption language, e.g. vi or en'),
        include_qa: z.boolean().optional().default(true)
      })
    },
    async ({ video, lang, include_qa }) => {
      try {
        const transcript = await fetchTranscript(video, lang);
        const qa = analyzeTranscript(transcript);
        const payload = {
          source: 'public_youtube_captions',
          video,
          language_requested: lang ?? null,
          qa: include_qa ? qa : undefined,
          transcript
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: 'text', text: `Transcript unavailable: ${message}` }]
        };
      }
    }
  );

  return server;
}

const mcp = createMcpHandler(buildServer);
const handleMcp = toNodeHandler(mcp);

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'youtube-reader', version: '1.0.1' });
    return;
  }
  if (url.pathname === '/privacy') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    res.end('YouTube Reader is read-only. It receives a YouTube URL or video ID, requests publicly available transcript data, returns it to the requesting client, and does not intentionally persist transcript content or user prompts.');
    return;
  }
  if (url.pathname === '/terms') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    res.end('Use YouTube Reader only for lawful access to publicly available transcript data. Users remain responsible for copyright, platform terms, and downstream use. No warranty of transcript availability or accuracy is provided.');
    return;
  }
  if (url.pathname === '/selftest') {
    const video = url.searchParams.get('video');
    const lang = url.searchParams.get('lang') || undefined;
    if (!video) {
      sendJson(res, 400, { ok: false, error: 'Missing video query parameter' });
      return;
    }
    try {
      const transcript = await fetchTranscript(video, lang);
      sendJson(res, 200, {
        ok: true,
        source: 'public_youtube_captions',
        video,
        language_requested: lang ?? null,
        qa: analyzeTranscript(transcript)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(res, 502, { ok: false, error: `Transcript unavailable: ${message}` });
    }
    return;
  }
  if (url.pathname === '/mcp') {
    await handleMcp(req, res);
    return;
  }
  sendJson(res, 200, {
    service: 'YouTube Reader',
    version: '1.0.1',
    mcp: '/mcp',
    health: '/health',
    selftest: '/selftest?video=<youtube-url-or-id>',
    privacy: '/privacy',
    terms: '/terms'
  });
});

httpServer.listen(process.env.PORT || 3000, '0.0.0.0');
