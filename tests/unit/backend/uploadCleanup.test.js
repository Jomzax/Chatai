import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  startUploadCleanupJob,
} from '../../../backend/src/services/uploadCleanup.js';

describe('uploadCleanup module exports', () => {
  it('exports startUploadCleanupJob as a function', () => {
    assert.equal(typeof startUploadCleanupJob, 'function');
  });

  it('startUploadCleanupJob returns synchronously without throwing (timer is unref-ed)', () => {
    assert.doesNotThrow(() => {
      startUploadCleanupJob();
    });
  });
});
