import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTranscript } from '../lib/validate.js';

test('accepts non-empty transcript', () => {
  const text = Array.from({ length: 30 }, (_, i) => `${Math.floor(i/2)}:${String((i*2)%60).padStart(2,'0')} unique transcript line ${i}`).join('\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.has_content, true);
  assert.equal(qa.suspicious_duplicates, false);
});

test('flags looping transcript', () => {
  const text = Array.from({ length: 20 }, () => '0:01 repeated line').join('\n');
  const qa = analyzeTranscript(text);
  assert.equal(qa.suspicious_duplicates, true);
});
