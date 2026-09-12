# OpenAI Plugins Directory Submission Pack — Video Transcript Reader

Status: RELEASE CANDIDATE / READY FOR PORTAL
Version: 1.0.5

## Listing

**Plugin name:** Video Transcript Reader

**Short description:** Read YouTube videos without watching the full video.

**Long description:** Retrieve a public YouTube transcript, check transcript completeness and duplication, then turn the video into a concise source-grounded summary with key ideas, evidence, timestamps, verification flags, and practical takeaways.

**Category:** Productivity

**Capabilities:** Read, MCP, bundled skill

**Developer:** vkentony1

**Website:** https://youtube-reader-chatgpt.vercel.app/

**Repository:** https://github.com/vkentony1/knowledge-work-plugins/tree/main/youtube-reader-chatgpt

**Support:** https://youtube-reader-chatgpt.vercel.app/support

**Privacy:** https://youtube-reader-chatgpt.vercel.app/privacy

**Terms:** https://youtube-reader-chatgpt.vercel.app/terms

**Authentication:** None in v1.

**Data storage:** No application database; no intentional transcript or prompt persistence.

**MCP URL type:** Universal

**MCP URL:** https://youtube-reader-chatgpt.vercel.app/mcp

**Countries:** Global where OpenAI and the transcript upstream are available, subject to publisher/legal readiness in the portal.

## Starter prompts

1. `/read https://youtu.be/...`
2. `Summarize this YouTube video so I do not have to watch the full video.`
3. `Extract the key ideas and important claims from this YouTube video.`
4. `Fact-check the material claims in this YouTube video.`

## Tool declaration

Tool: `read_youtube_transcript`

Annotations in production:
- `readOnlyHint: true`
- `openWorldHint: true`
- `destructiveHint: false`
- `idempotentHint: true`

Rationale: the tool is read-only and non-destructive, but it retrieves public data from an external internet service, so `openWorldHint` remains true.

## Positive test cases

### P1 — Vietnamese auto captions
Input: `/read https://youtu.be/sWj6-eR4XF0`
Expected tool/workflow: call `read_youtube_transcript`, inspect QA, then summarize in Vietnamese.
Expected result shape: transcript payload plus QA object; workflow returns concise summary, important claims, and verification flags rather than reproducing the full transcript.
Fixture: public benchmark video; no account required.

### P2 — English public captioned video
Input: `Summarize <public YouTube URL with English captions>`
Expected tool/workflow: retrieve transcript and summarize.
Expected result shape: concise summary with key claims and useful timestamps.
Fixture: any public captioned English YouTube video.

### P3 — Explicit language request
Input: `Read <multilingual public YouTube URL> using Vietnamese captions if available.`
Expected tool/workflow: call the transcript tool with `lang=vi`.
Expected result shape: requested caption track or a transparent unavailable error.
Fixture: public multilingual video.

### P4 — Fact-check request
Input: `Fact-check the important quantitative claims in <public captioned YouTube URL>.`
Expected tool/workflow: retrieve transcript first, then independently verify material current claims using appropriate sources.
Expected result shape: clearly distinguish VIDEO CLAIM / VERIFIED FACT / OPINION / INFERENCE.
Fixture: public captioned video containing checkable claims.

### P5 — Long video
Input: `/read <public captioned video longer than 60 minutes>`
Expected tool/workflow: retrieve transcript, inspect timestamp coverage, and surface material gaps rather than silently truncating.
Expected result shape: summary plus QA warning if coverage is incomplete.
Fixture: public long-form captioned video.

## Negative test cases

### N1 — Non-YouTube URL
Input: `/read https://example.com/article`
Expected: do not call the YouTube transcript tool; use an appropriate source-reading workflow instead.
Why: tool scope is public YouTube transcript retrieval only.

### N2 — Private/deleted/unavailable video
Input: `/read <private or deleted YouTube URL>`
Expected: clear unavailable/error result; do not invent transcript text.
Why: the tool cannot and must not bypass access controls.

### N3 — Request to post or modify YouTube
Input: `Use this plugin to edit the video description and publish a comment.`
Expected: refuse or route elsewhere because this plugin exposes no write/destructive action.
Why: the MCP is deliberately read-only.

## Production evidence

- Public production domain: https://youtube-reader-chatgpt.vercel.app/
- `/health`: public and versioned.
- `/mcp`: passed real MCP `initialize`, `tools/list`, and `tools/call` production smoke test in GitHub Actions.
- Benchmark self-test `sWj6-eR4XF0`: `qa_status=PASS`, first timestamp `0:02`, last timestamp `45:08`, 90 timestamps, observed timeline span ratio 0.9993, suspicious duplicates false.
- CI validates code syntax, plugin JSON, Vercel config, final skill file tree, unit tests, and production MCP smoke test.
- No API key, user credential, database, or intentional transcript persistence.

## Domain verification

OpenAI may generate a domain verification token during portal submission. The production route is already reserved at:

`https://youtube-reader-chatgpt.vercel.app/.well-known/openai-apps-challenge`

The route currently returns a placeholder until the portal generates the exact token. After receiving the token, update the deployed endpoint to return exactly that token and nothing else, then re-run portal verification.

## Release notes 1.0.5

Initial public submission candidate:
- one-link public YouTube transcript retrieval;
- bundled `/read` workflow skill;
- direct free/keyless transcript path with MCP fallback;
- transcript timestamp, monotonicity, timeline coverage, and duplicate-loop QA;
- read-only/non-destructive MCP tool annotations;
- no authentication, database, paid API, or intentional transcript persistence;
- public health, support, privacy, terms, and domain-challenge endpoints;
- automated production MCP smoke test.

## Remaining provider/owner gates

1. OpenAI Platform organization must have `Apps Management: Write` for the submitter (organization owners already have it).
2. Developer or business identity must be verified in the same OpenAI Platform organization used for submission.
3. Portal-generated domain challenge token must be copied once so Technology OS can deploy it to the reserved challenge route.
4. Final policy attestations and `Submit for Review` are provider-facing confirmations; owner authorization already exists for this publication objective, but any identity/legal attestation must be completed by the verified publisher.
5. After OpenAI approval, the publisher chooses when to press Publish; the owner has already requested public publication, subject to successful review and no material scope change.
