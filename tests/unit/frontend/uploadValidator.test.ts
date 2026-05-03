import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// @ts-ignore — frontend .ts compiled by tsx as CJS; runtime exposes named exports under default
import uploadModule from '../../../frontend/src/api/upload.ts';

const { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES, validateUploadFile } =
  uploadModule;

const createFile = (name: string, size: number): File => {
  const file = new File([new Uint8Array(0)], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('frontend upload validators', () => {
  it('exports the right constants', () => {
    assert.equal(MAX_UPLOAD_SIZE_BYTES, 5 * 1024 * 1024);
    assert.deepEqual(ALLOWED_UPLOAD_EXTENSIONS, ['.pdf', '.txt']);
  });

  it('accepts a small .pdf file', () => {
    assert.doesNotThrow(() => validateUploadFile(createFile('doc.pdf', 1024)));
  });

  it('accepts a .txt file regardless of letter case', () => {
    assert.doesNotThrow(() => validateUploadFile(createFile('NOTES.TXT', 1024)));
  });

  it('rejects a .docx file with a clear error', () => {
    assert.throws(
      () => validateUploadFile(createFile('report.docx', 100)),
      /PDF or TXT/
    );
  });

  it('rejects a file with no extension', () => {
    assert.throws(() => validateUploadFile(createFile('noext', 100)), /PDF or TXT/);
  });

  it('rejects a file larger than 5 MB', () => {
    assert.throws(
      () => validateUploadFile(createFile('big.pdf', MAX_UPLOAD_SIZE_BYTES + 1)),
      /too large/
    );
  });
});
