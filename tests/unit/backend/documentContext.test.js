import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildDocumentIndex,
  extractDocumentPages,
  getRelevantDocumentContext,
} from '../../../backend/src/services/documentContext.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '..', '..', 'fixtures', 'sample.txt');

describe('extractDocumentPages', () => {
  it('reads a .txt file as a single page with raw content', async () => {
    const pages = await extractDocumentPages({ filePath: FIXTURE, extension: '.txt' });

    assert.equal(pages.length, 1);
    assert.equal(pages[0].pageNumber, 1);
    assert.match(pages[0].text, /Chat AI Document Indexing Sample/);
  });

  it('returns no pages for unsupported extensions', async () => {
    const pages = await extractDocumentPages({ filePath: FIXTURE, extension: '.docx' });
    assert.deepEqual(pages, []);
  });
});

describe('buildDocumentIndex', () => {
  it('produces preview, length, and at least one well-formed chunk for a .txt file', async () => {
    const index = await buildDocumentIndex({ filePath: FIXTURE, extension: '.txt' });

    assert.equal(index.extractionStatus, 'ready');
    assert.ok(index.textLength > 0, 'textLength should be positive');
    assert.ok(index.textPreview.length > 0 && index.textPreview.length <= 1000);
    assert.ok(index.chunks.length >= 1);

    const firstChunk = index.chunks[0];
    assert.equal(firstChunk.index, 1);
    assert.equal(firstChunk.pageNumber, 1);
    assert.equal(firstChunk.lineStart, 1);
    assert.ok(firstChunk.lineEnd >= firstChunk.lineStart);
    assert.ok(firstChunk.text.length > 0);
  });

  it('produces multiple chunks with strictly increasing index for larger files', async () => {
    const fs = await import('node:fs/promises');
    const big = path.resolve(__dirname, '..', '..', 'fixtures', 'big.txt');
    const lines = Array.from({ length: 80 }, (_, i) => `Line ${i + 1} of fixture content alpha beta gamma`);
    await fs.writeFile(big, lines.join('\n'));

    try {
      const index = await buildDocumentIndex({ filePath: big, extension: '.txt' });
      assert.ok(index.chunks.length >= 2, 'large input should produce multiple chunks');
      for (let i = 1; i < index.chunks.length; i++) {
        assert.equal(index.chunks[i].index, i + 1);
      }
    } finally {
      await fs.unlink(big).catch(() => {});
    }
  });

  it('marks extractionStatus as empty when content cannot produce chunks', async () => {
    const emptyFile = path.resolve(__dirname, '..', '..', 'fixtures', 'empty.txt');
    const fs = await import('node:fs/promises');
    await fs.writeFile(emptyFile, '   \n\n   \n');

    try {
      const index = await buildDocumentIndex({ filePath: emptyFile, extension: '.txt' });
      assert.equal(index.extractionStatus, 'empty');
      assert.equal(index.chunks.length, 0);
    } finally {
      await fs.unlink(emptyFile).catch(() => {});
    }
  });
});

describe('getRelevantDocumentContext', () => {
  it('returns empty context when no documents are provided', async () => {
    const result = await getRelevantDocumentContext({
      documentIds: [],
      userId: undefined,
      query: 'hello world',
      clientDocuments: [],
    });

    assert.equal(result.mode, 'relevant');
    assert.deepEqual(result.documents, []);
    assert.equal(result.context, '');
  });

  it('switches into whole-document mode when query asks for a summary', async () => {
    const result = await getRelevantDocumentContext({
      documentIds: [],
      query: 'summarize the entire document please',
      clientDocuments: [],
    });

    assert.equal(result.mode, 'whole-document');
  });

  it('falls back to client metadata when stored docs are missing', async () => {
    const result = await getRelevantDocumentContext({
      documentIds: [],
      query: 'please give an overview',
      clientDocuments: [
        {
          id: 'client-doc-1',
          originalName: 'notes.txt',
          size: 123,
          textPreview: 'hello',
          textLength: 5,
        },
      ],
    });

    assert.equal(result.mode, 'whole-document');
    assert.equal(result.documents.length, 1);
    assert.equal(result.documents[0].id, 'client-doc-1');
    assert.equal(result.documents[0].originalName, 'notes.txt');
  });

  it('ignores client documents without an id', async () => {
    const result = await getRelevantDocumentContext({
      documentIds: [],
      query: 'anything',
      clientDocuments: [{ originalName: 'no-id.txt' }, null, undefined],
    });

    assert.deepEqual(result.documents, []);
  });
});
