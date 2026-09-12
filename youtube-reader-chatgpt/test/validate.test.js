import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTranscript } from '../lib/validate.js';

test('accepts non-empty transcript and captures timestamps', () => {
  const text = Array.from({ length: 30 }, (_, i) => `${Math.floor(i / 2)}:${String((i * 2) % 60).padStart(2, '0')} unique transcript line ${i}`).join('\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.has_content, true);
  assert.equal(qa.suspicious_duplicates, false);
  assert.equal(qa.first_timestamp, '0:00');
  assert.equal(qa.last_timestamp_seconds >= qa.first_timestamp_seconds, true);
});

test('flags exact looping transcript', () => {
  const text = Array.from({ length: 20 }, () => '0:01 repeated line').join('\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.suspicious_duplicates, true);
  assert.equal(qa.content_duplicate_ratio > 0.2, true);
});

test('flags repeated multi-line windows even when timestamps differ', () => {
  const block = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  const lines = [];
  for (let r = 0; r < 6; r += 1) {
    for (let i = 0; i < block.length; i += 1) {
      lines.push(`${r}:${String(i).padStart(2, '0')} ${block[i]}`);
    }
  }
  const qa = analyzeTranscript(lines.join('\n'));
  assert.equal(qa.suspicious_duplicates, true);
  assert.equal(qa.repeated_5line_window_ratio > 0.08, true);
});
