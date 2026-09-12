# Publishing checklist

1. Deploy this directory as a standalone Vercel project.
2. Verify `/health`, `/privacy`, `/terms`, and `/mcp` over HTTPS.
3. In ChatGPT Developer Mode, create a custom MCP app using the `/mcp` endpoint and scan tools.
4. Verify only `read_youtube_transcript` is exposed and permissions are read-only.
5. Run golden tests: manual captions, auto captions, Vietnamese captions, long video, duplicate-loop detection, unavailable captions, deleted/private video.
6. Add public privacy/terms URLs from the deployment to the app metadata.
7. Submit the app/plugin for directory review only after the golden tests pass.

Owner/UI gates: enabling Developer Mode, accepting Vercel/GitHub account prompts, and final directory submission/review acknowledgements may require the account owner in the UI.
