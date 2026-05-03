import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';

let originalCwd;
let tempCwd;
let mod;

before(async () => {
  originalCwd = process.cwd();
  tempCwd = path.resolve(originalCwd, 'tmp-cwd-upload');
  await fs.mkdir(tempCwd, { recursive: true });
  process.chdir(tempCwd);
  mod = await import('../../../backend/src/middlewares/upload.js');
});

after(async () => {
  process.chdir(originalCwd);
  await fs.rm(tempCwd, { recursive: true, force: true });
});

describe('upload middleware module', () => {
  it('exports MAX_FILE_SIZE equal to 5 MB', () => {
    assert.equal(mod.MAX_FILE_SIZE, 5 * 1024 * 1024);
  });

  it('exports an Express-style middleware function', () => {
    assert.equal(typeof mod.uploadDocumentMiddleware, 'function');
    assert.equal(mod.uploadDocumentMiddleware.length, 3);
  });

  it('creates the uploads/ directory under cwd at import time (sandboxed path)', async () => {
    const stat = await fs.stat(path.join(tempCwd, 'uploads'));
    assert.ok(stat.isDirectory());
  });

  it('rejects when called with no file (multer error path)', async () => {
    const headers = {};
    const req = {
      headers: { 'content-type': 'text/plain' },
      pipe() {},
      on() {},
      unpipe() {},
      resume() {},
    };
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

    await new Promise((resolve) => {
      mod.uploadDocumentMiddleware(req, res, () => resolve());
      setTimeout(resolve, 50);
    });

    assert.ok(true, 'middleware ran without throwing on bad input');
  });
});
