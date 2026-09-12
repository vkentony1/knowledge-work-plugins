# Deployment strategy

Target: Vercel free tier, Node.js 20+, project root `youtube-reader-chatgpt/`.

No paid API, database, queue, cron, or OpenAI API key is required for v1.

Primary dependency: public/keyless transcript MCP at `https://youtube-transcript.ai/mcp`, accessed only with the supplied YouTube URL/video ID and optional language code.

Rollback: point ChatGPT app back to the previous stable deployment or disable the app. The service has no mutable data to migrate.

Future v2, only if measured failures justify it: add a second extractor and optional speech-to-text fallback. Do not add proxy infrastructure speculatively.
