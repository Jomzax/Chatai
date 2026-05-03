import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore — frontend .ts compiled by tsx as CJS; runtime exposes named exports under default
import conversationsModule from '../../../frontend/src/api/conversations.ts';

const {
  createConversation,
  deleteConversation,
  listConversations,
  updateConversation,
} = conversationsModule;

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('frontend conversations API client', () => {
  it('listConversations returns the array from the response', async () => {
    globalThis.fetch = (async () =>
      okJson({ conversations: [{ id: '1', title: 'A', messages: [] }] })) as typeof fetch;

    const conversations = await listConversations();
    assert.equal(conversations.length, 1);
    assert.equal(conversations[0].id, '1');
  });

  it('createConversation posts payload and returns the created conversation', async () => {
    let url = '';
    let init: RequestInit | undefined;
    globalThis.fetch = (async (u: string, i?: RequestInit) => {
      url = String(u);
      init = i;
      return okJson({ conversation: { id: 'c1', title: 'T', messages: [] } });
    }) as typeof fetch;

    const conversation = await createConversation({ title: 'T' });

    assert.equal(conversation.id, 'c1');
    assert.match(url, /\/conversations$/);
    assert.equal(init?.method, 'POST');
    assert.equal(JSON.parse(String(init?.body)).title, 'T');
  });

  it('updateConversation issues PATCH with conversation id in path', async () => {
    let url = '';
    let init: RequestInit | undefined;
    globalThis.fetch = (async (u: string, i?: RequestInit) => {
      url = String(u);
      init = i;
      return okJson({ conversation: { id: 'c2', title: 'New', messages: [] } });
    }) as typeof fetch;

    await updateConversation('c2', { title: 'New' });
    assert.match(url, /\/conversations\/c2$/);
    assert.equal(init?.method, 'PATCH');
  });

  it('deleteConversation issues DELETE and resolves on success', async () => {
    let init: RequestInit | undefined;
    globalThis.fetch = (async (_u: string, i?: RequestInit) => {
      init = i;
      return okJson({ message: 'Conversation deleted.' });
    }) as typeof fetch;

    await deleteConversation('c3');
    assert.equal(init?.method, 'DELETE');
  });

  it('throws server-provided message on failure', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'Conversation not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(deleteConversation('missing'), /not found/);
  });

  it('falls back to default message when JSON parsing fails', async () => {
    globalThis.fetch = (async () =>
      new Response('garbage', { status: 500 })) as typeof fetch;

    await assert.rejects(listConversations(), /load conversations/);
  });
});
