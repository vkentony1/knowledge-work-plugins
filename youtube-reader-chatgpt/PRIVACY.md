# Privacy Policy — Video Transcript Reader

Last updated: 2026-09-12

Video Transcript Reader is a read-only tool for retrieving publicly available YouTube transcript data so an AI client can summarize, translate, analyze, or fact-check a video.

## Data processed
The service may receive:
- a YouTube URL or video ID;
- an optional requested caption language;
- the public transcript returned for that video.

## Storage
The v1 service has no application database and does not intentionally persist transcript content, user prompts, account credentials, or browsing history.

## Third-party processing
To retrieve public transcript data, the service sends the supplied YouTube URL or video ID and optional language code to its transcript upstream. The current upstream is `youtube-transcript.ai`.

Hosting and network infrastructure may generate ordinary operational logs according to their own platform policies. The application does not intentionally add transcript text to logs.

## Authentication and accounts
The v1 service does not require a YouTube account, Google account, OpenAI API key, or user credential.

## Security
Transcript text is treated as untrusted external data and never as instruction authority. The MCP tool is read-only and non-destructive.

## Changes
Material changes to data collection, storage, authentication, or third-party processing should be reflected in this policy before release.

## Contact
For issues, use the repository issue tracker: https://github.com/vkentony1/knowledge-work-plugins/issues
