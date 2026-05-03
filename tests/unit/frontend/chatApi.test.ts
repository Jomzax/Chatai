import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore — frontend .ts compiled by tsx as CJS; runtime exposes named exports under default
import chatModule from '../../../frontend/src/api/chat.ts';

const { streamChat } = chatModule;

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const streamingBody = (chunks: string[]) => {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
};

describe('frontend streamChat', () => {
  it('reads chunks via onChunk and posts the right payload', async () => {
    let capturedBody: any;
    globalThis.fetch = (async (_url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body));
      return new Response(streamingBody(['Hel', 'lo!']), { status: 200 });
    }) as typeof fetch;

    const received: string[] = [];
    await streamChat({
      messages: [{ role: 'user', content: 'hi' }],
      onChunk: (chunk: string) => received.push(chunk),
    });

    assert.deepEqual(received, ['Hel', 'lo!']);
    assert.equal(capturedBody.messages[0].content, 'hi');
    assert.deepEqual(capturedBody.documentIds, []);
    assert.deepEqual(capturedBody.documents, []);
  });

  it('throws server-provided error message on non-OK response', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'nope' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(
      streamChat({
        messages: [{ role: 'user', content: 'hi' }],
        onChunk: () => {},
      }),
      /nope/
    );
  });

  it('appends Thai retry hint on 429 with retryAfter', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'Rate limited.', retryAfter: 90 }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(
      streamChat({
        messages: [{ role: 'user', content: 'hi' }],
        onChunk: () => {},
      }),
      /1 นาที 30 วินาที/
    );
  });

  it('uses seconds-only formatter when retryAfter < 60', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'Slow down.', retryAfter: 30 }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(
      streamChat({
        messages: [{ role: 'user', content: 'hi' }],
        onChunk: () => {},
      }),
      /30 วินาที/
    );
  });

  it('throws when response body is unavailable', async () => {
    globalThis.fetch = (async () =>
      new Response(null, { status: 200 })) as typeof fetch;

    await assert.rejects(
      streamChat({
        messages: [{ role: 'user', content: 'hi' }],
        onChunk: () => {},
      }),
      /unavailable/
    );
  });
});
