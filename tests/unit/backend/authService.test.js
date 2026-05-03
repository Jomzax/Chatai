import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  registerUser,
  findPublicUserById,
} from '../../../backend/src/services/authService.js';

describe('authService — registerUser validation', () => {
  it('rejects when email is missing', async () => {
    await assert.rejects(
      registerUser({ email: '', password: 'longenough', name: 'A' }),
      (error) => {
        assert.match(error.message, /valid email/);
        assert.equal(error.statusCode, 400);
        return true;
      }
    );
  });

  it('rejects when email lacks "@"', async () => {
    await assert.rejects(
      registerUser({ email: 'no-at-sign', password: 'longenough' }),
      /valid email/
    );
  });

  it('rejects when password is shorter than 8 characters', async () => {
    await assert.rejects(
      registerUser({ email: 'user@example.com', password: 'short' }),
      (error) => {
        assert.match(error.message, /at least 8 characters/);
        assert.equal(error.statusCode, 400);
        return true;
      }
    );
  });

  it('treats null email as invalid', async () => {
    await assert.rejects(
      registerUser({ email: null, password: 'longenough' }),
      /valid email/
    );
  });
});

describe('authService — findPublicUserById', () => {
  it('returns null when no userId is provided', async () => {
    assert.equal(await findPublicUserById(null), null);
    assert.equal(await findPublicUserById(undefined), null);
    assert.equal(await findPublicUserById(''), null);
  });
});
