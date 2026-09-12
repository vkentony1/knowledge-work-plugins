# YouTube Reader for ChatGPT

Free, read-only MCP app for `/read <YouTube URL>` workflows.

## Goal
Paste a YouTube URL in ChatGPT and let the model retrieve the public transcript, validate basic transcript quality, then summarize/fact-check it without manual copy/paste.

## Design
- Read-only.
- No OpenAI API key required.
- No database.
- No intentional transcript persistence.
- Hosted MCP endpoint: `/mcp`.
- Primary transcript engine is the free/keyless `youtube-transcript.ai` MCP service; this app adds a stable app boundary and transcript QA metadata for Technology OS.
- If the upstream provider is unavailable, the tool returns an explicit error rather than inventing text.

## Local
```bash
npm install
npm test
npm start
```
Health: `http://localhost:3000/health`
MCP: `http://localhost:3000/mcp`

## Vercel
Import this directory as the Vercel project root. Node servers with `server.js`/`server.ts` are supported by Vercel's zero-config Node runtime. No secrets are required for v1.

After deployment, use:
`https://<your-domain>/mcp`

## ChatGPT app
Create/connect an MCP app using the deployed `/mcp` URL, scan the tool `read_youtube_transcript`, and keep permissions read-only.

Recommended prompt:
`/read https://youtu.be/...`

Expected ChatGPT behavior:
1. Call `read_youtube_transcript`.
2. Check returned QA fields.
3. Summarize main thesis, arguments, evidence, timestamps, and claims that need independent verification.
4. Do not reproduce a copyrighted transcript verbatim unless allowed; use it as analysis input.

## Privacy
See `/privacy`. The service does not intentionally store transcript content or prompts.

## Limitations
Public captions only. Availability and accuracy depend on YouTube caption availability and the upstream transcript engine. Videos without captions require a future speech-to-text fallback lane.
