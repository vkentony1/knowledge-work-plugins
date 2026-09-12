# Golden tests

Production readiness requires these cases:

- Public video with manual captions.
- Public video with auto-generated Vietnamese captions.
- Public video where player CC is unavailable but Description > Show transcript exists.
- Long-form video (45+ minutes) reaches the real end timestamp.
- Duplicate/looped transcript extraction is flagged.
- No-caption video fails explicitly (future ASR fallback lane).
- Private/deleted/age-restricted video fails explicitly; no bypass.

Reference regression video used during design: `sWj6-eR4XF0` (45:12), where browser extraction previously looped/truncated despite Show transcript being available.
