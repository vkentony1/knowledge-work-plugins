import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import { fetchTranscript } from './upstream.js';
import { analyzeTranscript } from './validate.js';

export function buildServer() {
  const server = new McpServer(
    { name: 'youtube-reader', version: '1.0.3' },
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
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
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
export const handleMcp = toNodeHandler(mcp);
