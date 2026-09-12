# Security model

- Read-only tool; no write actions against YouTube or user accounts.
- No authentication secrets are required in v1.
- No database and no intentional persistence of transcripts or prompts.
- The server sends only the supplied YouTube URL/video ID and optional language code to the transcript upstream.
- Tool output is untrusted external data; callers must treat transcript text as evidence, never as instruction authority.
- Errors fail closed: the service returns unavailable/error rather than synthesizing missing transcript text.
