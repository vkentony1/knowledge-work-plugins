function parseColonTimestamp(value) {
  const parts = value.split(':').map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatSeconds(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

function extractTimestamps(text) {
  const timestamps = [];
  const patterns = [
    // Provider direct TXT format: [m:ss] or [h:mm:ss]
    { regex: /\[((?:\d{1,2}:)?\d{1,3}:\d{2})\]/g, parse: (m) => parseColonTimestamp(m[1]), label: (m) => m[1] },
    // Some upstream payloads expose decimal second markers like [4.12s].
    { regex: /\[(\d+(?:\.\d+)?)s\]/gi, parse: (m) => Number(m[1]), label: (m) => formatSeconds(Number(m[1])) },
    // Legacy/plain transcript rows with an unbracketed colon timestamp.
    { regex: /(?:^|\s)((?:\d{1,2}:)?\d{1,3}:\d{2})(?=\s|$)/gm, parse: (m) => parseColonTimestamp(m[1]), label: (m) => m[1] }
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern.regex)) {
      const seconds = pattern.parse(match);
      if (seconds === null || Number.isNaN(seconds)) continue;
      timestamps.push({ text: pattern.label(match), seconds, index: match.index ?? 0 });
    }
  }

  // Multiple regexes can match the same timestamp. Sort by document order and de-dupe
  // identical location/second pairs while preserving real repeated timestamps.
  timestamps.sort((a, b) => a.index - b.index || a.seconds - b.seconds);
  return timestamps.filter((item, i, arr) => i === 0 || item.index !== arr[i - 1].index || item.seconds !== arr[i - 1].seconds);
}

function stripTimestamp(line) {
  return line
    .replace(/^\s*\[(?:(?:\d{1,2}:)?\d{1,3}:\d{2}|\d+(?:\.\d+)?s)\]\s*/i, '')
    .replace(/^\s*(?:\d{1,2}:)?\d{1,3}:\d{2}\s*/, '')
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

function monotonicityRatio(timestamps) {
  if (timestamps.length < 2) return timestamps.length === 1 ? 1 : null;
  let nonDecreasing = 0;
  for (let i = 1; i < timestamps.length; i += 1) {
    if (timestamps[i].seconds >= timestamps[i - 1].seconds) nonDecreasing += 1;
  }
  return nonDecreasing / (timestamps.length - 1);
}

export function analyzeTranscript(text) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const timestamps = extractTimestamps(text);

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
  const monotonicity = monotonicityRatio(timestamps);
  const startsNearZero = firstTimestamp ? firstTimestamp.seconds <= 15 : false;
  const observedSpanRatio = firstTimestamp && lastTimestamp && lastTimestamp.seconds > 0
    ? (lastTimestamp.seconds - firstTimestamp.seconds) / lastTimestamp.seconds
    : null;

  const suspiciousDuplicates = contentDuplicateRatio > 0.2 || windowDuplicateRatio > 0.08;
  const hasContent = text.trim().length > 100;
  const timelineLooksUsable = timestamps.length >= 2 && startsNearZero && (monotonicity ?? 0) >= 0.98;

  let qaStatus = 'FAIL';
  if (hasContent && !suspiciousDuplicates && timelineLooksUsable) qaStatus = 'PASS';
  else if (hasContent && !suspiciousDuplicates) qaStatus = 'WARN';

  return {
    qa_status: qaStatus,
    chars: text.length,
    lines: lines.length,
    timestamp_count: timestamps.length,
    first_timestamp: firstTimestamp?.text ?? null,
    first_timestamp_seconds: firstTimestamp?.seconds ?? null,
    last_timestamp: lastTimestamp?.text ?? null,
    last_timestamp_seconds: lastTimestamp?.seconds ?? null,
    starts_near_zero: startsNearZero,
    timestamp_monotonicity_ratio: monotonicity === null ? null : Number(monotonicity.toFixed(4)),
    observed_timeline_span_ratio: observedSpanRatio === null ? null : Number(observedSpanRatio.toFixed(4)),
    content_duplicate_ratio: Number(contentDuplicateRatio.toFixed(4)),
    repeated_5line_window_ratio: Number(windowDuplicateRatio.toFixed(4)),
    suspicious_duplicates: suspiciousDuplicates,
    has_content: hasContent
  };
}
