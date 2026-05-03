import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore — frontend .ts compiled by tsx as CJS; runtime exposes named exports under default
import uploadModule from '../../../frontend/src/api/upload.ts';

const { deleteDocument, uploadDocument } = uploadModule;

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const createFile = (name: string, size = 100): File => {
  const file = new File([new Uint8Array(0)], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('frontend uploadDocument', () => {
  it('rejects invalid extension before making any HTTP call', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return okJson({});
    }) as typeof fetch;

    await assert.rejects(uploadDocument(createFile('exploit.exe')), /PDF or TXT/);
    assert.equal(called, false, 'fetch must not be called when validation fails');
  });

  it('returns parsed payload on success', async () => {
    globalThis.fetch = (async () =>
      okJson({ message: 'ok', file: { id: 'f1', originalName: 'a.pdf' } })) as typeof fetch;

    const payload = await uploadDocument(createFile('a.pdf'));
    assert.equal(payload.file.id, 'f1');
  });

  it('throws server-provided message on non-OK response', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'Too big.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(uploadDocument(createFile('a.pdf')), /Too big/);
  });
});

describe('frontend deleteDocument', () => {
  it('issues DELETE on the matching id', async () => {
    let url = '';
    let init: RequestInit | undefined;
    globalThis.fetch = (async (u: string, i?: RequestInit) => {
      url = String(u);
      init = i;
      return okJson({ message: 'File deleted successfully.' });
    }) as typeof fetch;

    await deleteDocument('abc123');
    assert.match(url, /\/uploads\/abc123$/);
    assert.equal(init?.method, 'DELETE');
  });

  it('throws on non-OK with server message', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'File not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(deleteDocument('missing'), /not found/);
  });
});
