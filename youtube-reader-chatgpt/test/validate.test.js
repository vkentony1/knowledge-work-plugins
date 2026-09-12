import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTranscript } from '../lib/validate.js';

test('accepts non-empty transcript and captures plain timestamps', () => {
  const text = Array.from({ length: 30 }, (_, i) => `${Math.floor(i / 2)}:${String((i * 2) % 60).padStart(2, '0')} unique transcript line ${i}`).join('\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.has_content, true);
  assert.equal(qa.suspicious_duplicates, false);
  assert.equal(qa.first_timestamp, '0:00');
  assert.equal(qa.last_timestamp_seconds >= qa.first_timestamp_seconds, true);
});

test('parses provider direct TXT bracket timestamps and passes QA', () => {
  const text = Array.from({ length: 40 }, (_, i) => {
    const seconds = i * 70;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `[${m}:${String(s).padStart(2, '0')}] paragraph ${i} with enough unique transcript content to represent a real caption block.`;
  }).join('\n\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.first_timestamp, '0:00');
  assert.equal(qa.starts_near_zero, true);
  assert.equal(qa.timestamp_count, 40);
  assert.equal(qa.timestamp_monotonicity_ratio, 1);
  assert.equal(qa.qa_status, 'PASS');
});

test('parses decimal second markers from MCP-style payloads', () => {
  const text = Array.from({ length: 25 }, (_, i) => `[${(i * 8.5).toFixed(2)}s] unique caption text ${i} with enough material for validation`).join('\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.first_timestamp, '0:00');
  assert.equal(qa.timestamp_count, 25);
  assert.equal(qa.timestamp_monotonicity_ratio, 1);
  assert.equal(qa.qa_status, 'PASS');
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
