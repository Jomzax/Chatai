import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { requireAuth } from '../../../backend/src/middlewares/auth.js';

const createRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

describe('requireAuth middleware', () => {
  it('returns 401 when no session userId is present', async () => {
    const res = createRes();
    let nextCalled = false;
    await requireAuth({ session: undefined }, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /sign in/);
    assert.equal(nextCalled, false);
  });

  it('returns 401 when session.userId is empty', async () => {
    const res = createRes();
    let nextCalled = false;
    await requireAuth({ session: { userId: '' } }, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('forwards thrown errors to next() when User.findById blows up', async () => {
    const res = createRes();
    let receivedError;
    await requireAuth(
      { session: { userId: 'definitely-not-a-valid-objectid' } },
      res,
      (err) => {
        receivedError = err;
      }
    );

    assert.ok(receivedError instanceof Error, 'next should be called with the thrown error');
  });
});
