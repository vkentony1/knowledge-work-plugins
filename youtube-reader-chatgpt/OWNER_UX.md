# Owner UX contract

Primary invocation:

`/read <youtube-url>`

The system should automatically:
1. Retrieve the transcript through `read_youtube_transcript`.
2. Validate transcript quality/duplication.
3. Summarize thesis, key arguments, evidence, timestamps, and action-relevant insights.
4. Independently verify material factual claims when needed.
5. Surface only data gaps that materially affect the conclusion.

The owner should not need to open YouTube transcript UI, copy text, select a provider, manage retries, or choose an executor for routine use.
