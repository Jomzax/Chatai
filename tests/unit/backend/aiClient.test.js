import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import {
  CHAT_TIMEOUT_MS,
  streamAiChat,
} from '../../../backend/src/services/aiClient.js';

let originalGemini;
let originalClaude;

before(() => {
  originalGemini = process.env.GEMINI_API_KEYS;
  originalClaude = process.env.ANTHROPIC_API_KEYS;
  delete process.env.GEMINI_API_KEYS;
  delete process.env.ANTHROPIC_API_KEYS;
});

after(() => {
  if (originalGemini !== undefined) process.env.GEMINI_API_KEYS = originalGemini;
  if (originalClaude !== undefined) process.env.ANTHROPIC_API_KEYS = originalClaude;
});

describe('aiClient — exports', () => {
  it('exports a positive numeric CHAT_TIMEOUT_MS', () => {
    assert.equal(typeof CHAT_TIMEOUT_MS, 'number');
    assert.ok(CHAT_TIMEOUT_MS > 0);
  });
});

describe('streamAiChat — mock provider path (no API keys)', () => {
  it('streams the demo response in multiple chunks', async () => {
    const chunks = [];
    const controller = new AbortController();

    await streamAiChat({
      messages: [{ role: 'user', content: 'hello' }],
      signal: controller.signal,
      onChunk: (chunk) => chunks.push(chunk),
    });

    assert.ok(chunks.length > 1, 'should produce multiple chunks');
    const joined = chunks.join('');
    assert.match(joined, /Demo AI response/);
    assert.match(joined, /hello/);
  });

  it('aborts mid-stream when the signal is aborted', async () => {
    const controller = new AbortController();
    const chunks = [];

    setTimeout(() => controller.abort(), 30);

    await assert.rejects(
      streamAiChat({
        messages: [{ role: 'user', content: 'long input that should be cut short' }],
        signal: controller.signal,
        onChunk: (chunk) => chunks.push(chunk),
      }),
      (error) => {
        assert.equal(error.statusCode, 504);
        return true;
      }
    );
  });

  it('falls back to a default user message when none is found', async () => {
    const chunks = [];
    const controller = new AbortController();

    await streamAiChat({
      messages: [{ role: 'assistant', content: 'no user message here' }],
      signal: controller.signal,
      onChunk: (chunk) => chunks.push(chunk),
    });

    assert.match(chunks.join(''), /your message/);
  });
});
