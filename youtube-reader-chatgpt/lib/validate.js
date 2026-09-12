export function analyzeTranscript(text) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const timestampLines = lines.filter((l) => /(?:^|\s)(?:\d{1,2}:)?\d{1,2}:\d{2}(?:\s|$)/.test(l));
  const normalized = lines.map((l) => l.replace(/\s+/g, ' ').toLowerCase());
  const unique = new Set(normalized);
  const duplicateRatio = lines.length ? 1 - unique.size / lines.length : 1;
  return {
    chars: text.length,
    lines: lines.length,
    timestamp_lines: timestampLines.length,
    duplicate_ratio: Number(duplicateRatio.toFixed(4)),
    suspicious_duplicates: duplicateRatio > 0.2,
    has_content: text.trim().length > 100
  };
}
