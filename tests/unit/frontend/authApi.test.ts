import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore — frontend .ts compiled by tsx as CJS; runtime exposes named exports under default
import authModule from '../../../frontend/src/api/auth.ts';

const { getCurrentUser, loginUser, logoutUser, registerUser } = authModule;

type FetchInput = { url: string; init?: RequestInit };

const installFetchMock = (responder: (input: FetchInput) => Response) => {
  const calls: FetchInput[] = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    const call = { url: String(url), init };
    calls.push(call);
    return responder(call);
  }) as typeof fetch;
  return calls;
};

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const badJson = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('frontend auth API client', () => {
  it('loginUser returns the user on a successful response', async () => {
    const calls = installFetchMock(() =>
      okJson({ user: { id: '1', email: 'a@b.c', name: 'A' } })
    );
    const user = await loginUser('a@b.c', 'pw');
    assert.deepEqual(user, { id: '1', email: 'a@b.c', name: 'A' });
    assert.match(calls[0].url, /\/auth\/login$/);
    assert.equal(calls[0].init?.method, 'POST');
    assert.equal(JSON.parse(String(calls[0].init?.body)).email, 'a@b.c');
  });

  it('loginUser throws using server-provided message', async () => {
    installFetchMock(() => badJson(401, { message: 'Bad creds' }));
    await assert.rejects(loginUser('a@b.c', 'wrong'), /Bad creds/);
  });

  it('loginUser falls back to a default message when payload is missing', async () => {
    installFetchMock(() => new Response('not json', { status: 500 }));
    await assert.rejects(loginUser('x', 'y'), /Authentication failed/);
  });

  it('registerUser derives name from the email local-part', async () => {
    const calls = installFetchMock(() =>
      okJson({ user: { id: '2', email: 'jane@example.com', name: 'jane' } })
    );
    await registerUser('jane@example.com', 'longenough');

    const body = JSON.parse(String(calls[0].init?.body));
    assert.equal(body.name, 'jane');
    assert.match(calls[0].url, /\/auth\/register$/);
  });

  it('getCurrentUser returns the user from a 200 session response', async () => {
    installFetchMock(() => okJson({ user: { id: '7', email: 'me@x', name: 'Me' } }));
    const user = await getCurrentUser();
    assert.equal(user.id, '7');
  });

  it('logoutUser sends a POST to /auth/logout', async () => {
    const calls = installFetchMock(() => okJson({ message: 'Logged out.' }));
    await logoutUser();
    assert.match(calls[0].url, /\/auth\/logout$/);
    assert.equal(calls[0].init?.method, 'POST');
  });
});
