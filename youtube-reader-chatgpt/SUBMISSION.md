# OpenAI Plugin Directory Submission Pack — Video Transcript Reader

Status: PREPARED / NOT YET SUBMITTED
Version: 1.0.2

## Listing

**Plugin name:** Video Transcript Reader

**Short description:** Read YouTube videos without watching the full video.

**Long description:** Retrieve a public YouTube transcript, check transcript completeness and duplication, then turn the video into a concise source-grounded summary with key ideas, evidence, timestamps, verification flags, and practical takeaways.

**Category:** Productivity

**Capabilities:** Read, MCP

**Developer:** vkentony1

**Repository / website:** https://github.com/vkentony1/knowledge-work-plugins/tree/main/youtube-reader-chatgpt

**Privacy:** https://github.com/vkentony1/knowledge-work-plugins/blob/main/youtube-reader-chatgpt/PRIVACY.md

**Terms:** https://github.com/vkentony1/knowledge-work-plugins/blob/main/youtube-reader-chatgpt/TERMS.md

**Authentication:** None in v1.

**Data storage:** No application database; no intentional transcript or prompt persistence.

**MCP URL:** PENDING_FINAL_PUBLIC_PRODUCTION_DOMAIN/mcp

**Support:** https://github.com/vkentony1/knowledge-work-plugins/issues

**Countries:** Global where OpenAI and the transcript upstream are available.

## Starter prompts

1. `/read https://youtu.be/...`
2. `Summarize this YouTube video so I do not have to watch the full video.`
3. `Extract the key ideas and important claims from this YouTube video.`
4. `Fact-check the material claims in this YouTube video.`

## Tool declaration

Tool: `read_youtube_transcript`

Expected annotations:
- `readOnlyHint: true`
- `openWorldHint: false`
- `destructiveHint: false`

The tool must remain read-only. Any future write action requires a separate review and version.

## Positive test cases

### P1 — Vietnamese auto captions
Input: `/read https://youtu.be/sWj6-eR4XF0`
Expected: transcript retrieved; QA available; summary in Vietnamese; duplicate/loop artifacts are not double-counted; no full transcript reproduction.

### P2 — English public captioned video
Input: `Summarize <public YouTube URL with English captions>`
Expected: transcript retrieved; concise summary; key claims and timestamps when useful.

### P3 — Explicit language request
Input: `Read <multilingual public YouTube URL> using Vietnamese captions if available.`
Expected: `lang=vi` requested; result reflects requested track or fails transparently if unavailable.

### P4 — Fact-check request
Input: `Fact-check the important quantitative claims in <public captioned YouTube URL>.`
Expected: transcript is retrieved first; video claims are distinguished from independently verified facts; unsupported claims are not presented as facts.

### P5 — Long video
Input: `/read <public captioned video longer than 60 minutes>`
Expected: no silent truncation; QA timestamps are checked; material coverage gaps are surfaced.

## Negative test cases

### N1 — Non-YouTube URL
Input: `/read https://example.com/article`
Expected: do not call the YouTube transcript tool; use an appropriate source-reading workflow instead.

### N2 — Private/deleted/unavailable video
Input: `/read <private or deleted YouTube URL>`
Expected: clear unavailable/error result; do not invent transcript text.

### N3 — Request to post or modify YouTube
Input: `Use this plugin to edit the video description and publish a comment.`
Expected: refuse/route elsewhere because this plugin exposes no write or destructive action.

## Golden QA gates before submission

- `/health` is public HTTPS and returns version.
- `/privacy` and `/terms` are public HTTPS.
- `/mcp` completes MCP initialize and `tools/list`.
- Only intended read-only transcript tool is exposed.
- Benchmark video reaches approximately its final timestamp and duplicate flag behaves correctly.
- CI passes on the exact submitted commit.
- No secret/API key is embedded in repo or MCP output.
- Production domain remains stable across redeploys.
- Privacy/terms URLs in the listing match deployed policy pages.

## Domain verification

If OpenAI provides a domain challenge token, add a public route:

`/.well-known/openai-apps-challenge`

The route must return the exact owner-provided challenge token and nothing else. Never guess or pre-generate the token.

## Release notes 1.0.2

Initial public candidate:
- one-link YouTube transcript retrieval;
- `/read` workflow skill;
- transcript timestamp and duplicate QA;
- read-only/non-destructive MCP annotations;
- no authentication, database, paid API, or intentional transcript persistence;
- safe self-test endpoint that returns QA only.

## Remaining owner/provider gates

1. Resolve and verify the final public Vercel Production Domain.
2. Complete OpenAI developer identity / organization permission requirements if the submission portal requests them.
3. Provide the OpenAI domain-verification challenge token if generated.
4. Review the final listing and press the provider submission/publish control when OpenAI requires an explicit owner acknowledgement.

All routine code, tests, deployment updates, and evidence checks should be handled by Technology OS rather than delegated to the owner.
