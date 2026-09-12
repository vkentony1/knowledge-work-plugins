import { createServer } from 'node:http';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import { fetchTranscript } from './lib/upstream.js';
import { analyzeTranscript } from './lib/validate.js';

function buildServer() {
  const server = new McpServer(
    { name: 'youtube-reader', version: '1.0.0' },
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

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'youtube-reader', version: '1.0.0' }));
    return;
  }
  if (url.pathname === '/privacy') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('YouTube Reader is read-only. It receives a YouTube URL or video ID, requests publicly available transcript data, returns it to the requesting client, and does not intentionally persist transcript content or user prompts.');
    return;
  }
  if (url.pathname === '/terms') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Use YouTube Reader only for lawful access to publicly available transcript data. Users remain responsible for copyright, platform terms, and downstream use. No warranty of transcript availability or accuracy is provided.');
    return;
  }
  if (url.pathname === '/mcp') {
    await handleMcp(req, res);
    return;
  }
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ service: 'YouTube Reader', mcp: '/mcp', health: '/health', privacy: '/privacy', terms: '/terms' }));
});

httpServer.listen(process.env.PORT || 3000, '0.0.0.0');
