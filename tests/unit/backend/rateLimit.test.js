import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { createRateLimit } from '../../../backend/src/middlewares/rateLimit.js';

const createMockRes = () => {
  const headers = {};
  const res = {
    statusCode: 200,
    body: undefined,
    headers,
    setHeader(name, value) {
      headers[name] = value;
    },
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

const createMockReq = ({ ip = '10.0.0.1', userId } = {}) => ({
  ip,
  socket: { remoteAddress: ip },
  user: userId ? { id: userId } : undefined,
});

describe('createRateLimit', () => {
  let nextCalls;
  let next;

  beforeEach(() => {
    nextCalls = 0;
    next = () => {
      nextCalls += 1;
    };
  });

  it('allows requests under the limit and sets rate limit headers', () => {
    const limiter = createRateLimit({ maxRequests: 3, windowMs: 1000 });
    const req = createMockReq({ ip: '1.1.1.1' });
    const res = createMockRes();

    limiter(req, res, next);

    assert.equal(nextCalls, 1);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['X-RateLimit-Limit'], 3);
    assert.equal(res.headers['X-RateLimit-Remaining'], 2);
    assert.ok(res.headers['X-RateLimit-Reset'] > 0);
  });

  it('blocks the request once the limit is exceeded with 429 + Retry-After', () => {
    const limiter = createRateLimit({ maxRequests: 2, windowMs: 60_000 });
    const req = createMockReq({ ip: '2.2.2.2' });

    limiter(req, createMockRes(), next);
    limiter(req, createMockRes(), next);
    const finalRes = createMockRes();
    limiter(req, finalRes, next);

    assert.equal(nextCalls, 2, 'next() must only fire while under the limit');
    assert.equal(finalRes.statusCode, 429);
    assert.match(finalRes.body.message, /Try again in/);
    assert.ok(finalRes.body.retryAfter > 0);
    assert.ok(finalRes.headers['Retry-After'] > 0);
  });

  it('isolates buckets by user id over IP when req.user is present', () => {
    const limiter = createRateLimit({ maxRequests: 1, windowMs: 60_000 });

    const userReq = createMockReq({ ip: '9.9.9.9', userId: 'user-A' });
    const ipReq = createMockReq({ ip: '9.9.9.9' });

    limiter(userReq, createMockRes(), next);
    limiter(ipReq, createMockRes(), next);

    assert.equal(nextCalls, 2, 'different bucket keys do not share counters');
  });

  it('falls back to defaults when invalid options are supplied', () => {
    const limiter = createRateLimit({ maxRequests: 0, windowMs: 'oops' });
    const res = createMockRes();
    limiter(createMockReq({ ip: '3.3.3.3' }), res, next);

    assert.equal(res.headers['X-RateLimit-Limit'], 20);
    assert.equal(nextCalls, 1);
  });

  it('formats Retry-After across seconds and minutes', async () => {
    const shortLimiter = createRateLimit({ maxRequests: 1, windowMs: 5000 });
    const req = createMockReq({ ip: '4.4.4.4' });
    shortLimiter(req, createMockRes(), next);
    const blockedRes = createMockRes();
    shortLimiter(req, blockedRes, next);
    assert.match(blockedRes.body.message, /seconds?\./);

    const longLimiter = createRateLimit({ maxRequests: 1, windowMs: 65_000 });
    const req2 = createMockReq({ ip: '5.5.5.5' });
    longLimiter(req2, createMockRes(), next);
    const blockedRes2 = createMockRes();
    longLimiter(req2, blockedRes2, next);
    assert.match(blockedRes2.body.message, /minutes?/);
  });

  it('uses a stable unknown key when neither user nor ip exists', () => {
    const limiter = createRateLimit({ maxRequests: 1, windowMs: 60_000 });
    const req = { socket: {} };

    limiter(req, createMockRes(), next);
    const blocked = createMockRes();
    limiter(req, blocked, next);

    assert.equal(blocked.statusCode, 429);
  });
});
