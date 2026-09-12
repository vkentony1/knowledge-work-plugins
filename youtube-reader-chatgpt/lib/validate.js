function parseTimestampSeconds(value) {
  const parts = value.split(':').map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function stripTimestamp(line) {
  return line
    .replace(/^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function repeatedWindowRatio(lines, size = 5) {
  if (lines.length < size * 2) return 0;
  const windows = [];
  for (let i = 0; i <= lines.length - size; i += 1) {
    windows.push(lines.slice(i, i + size).join(' | '));
  }
  const unique = new Set(windows);
  return windows.length ? 1 - unique.size / windows.length : 0;
}

export function analyzeTranscript(text) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const timestampRegex = /(?:^|\s)((?:\d{1,2}:)?\d{1,2}:\d{2})(?=\s|$)/g;
  const timestamps = [];

  for (const line of lines) {
    for (const match of line.matchAll(timestampRegex)) {
      const seconds = parseTimestampSeconds(match[1]);
      if (seconds !== null) timestamps.push({ text: match[1], seconds });
    }
  }

  const normalizedContent = lines.map(stripTimestamp).filter(Boolean);
  const uniqueContent = new Set(normalizedContent);
  const contentDuplicateRatio = normalizedContent.length
    ? 1 - uniqueContent.size / normalizedContent.length
    : 1;
  const windowDuplicateRatio = repeatedWindowRatio(normalizedContent, 5);

  const firstTimestamp = timestamps.length
    ? timestamps.reduce((a, b) => (a.seconds <= b.seconds ? a : b))
    : null;
  const lastTimestamp = timestamps.length
    ? timestamps.reduce((a, b) => (a.seconds >= b.seconds ? a : b))
    : null;

  const suspiciousDuplicates = contentDuplicateRatio > 0.2 || windowDuplicateRatio > 0.08;

  return {
    chars: text.length,
    lines: lines.length,
    timestamp_count: timestamps.length,
    first_timestamp: firstTimestamp?.text ?? null,
    first_timestamp_seconds: firstTimestamp?.seconds ?? null,
    last_timestamp: lastTimestamp?.text ?? null,
    last_timestamp_seconds: lastTimestamp?.seconds ?? null,
    content_duplicate_ratio: Number(contentDuplicateRatio.toFixed(4)),
    repeated_5line_window_ratio: Number(windowDuplicateRatio.toFixed(4)),
    suspicious_duplicates: suspiciousDuplicates,
    has_content: text.trim().length > 100
  };
}
