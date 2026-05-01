import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import Upload from '../models/upload.js';

const LINES_PER_CHUNK = 28;
const LINE_OVERLAP = 4;
const MAX_CONTEXT_CHARS = Number(process.env.DOCUMENT_CONTEXT_CHARS || 12000);
const MAX_DOCUMENTS_PER_CHAT = Number(process.env.MAX_DOCUMENTS_PER_CHAT || 5);

const normalizeText = (text) =>
  String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const splitLines = (text) =>
  normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const tokenize = (text) =>
  new Set(
    normalizeText(text)
      .toLowerCase()
      .split(/[^\p{L}\p{N}_]+/u)
      .filter((token) => token.length >= 2)
  );

const chunkPage = ({ text, pageNumber }) => {
  const lines = splitLines(text);
  const chunks = [];

  for (let start = 0; start < lines.length; start += LINES_PER_CHUNK - LINE_OVERLAP) {
    const selectedLines = lines.slice(start, start + LINES_PER_CHUNK);

    if (selectedLines.length === 0) {
      continue;
    }

    chunks.push({
      text: selectedLines.join('\n'),
      pageNumber,
      lineStart: start + 1,
      lineEnd: start + selectedLines.length,
    });
  }

  return chunks;
};

const extractPdfPages = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    return (result.pages || []).map((page) => ({
      pageNumber: page.num,
      text: page.text || '',
    }));
  } finally {
    await parser.destroy();
  }
};

export const extractDocumentPages = async ({ filePath, extension }) => {
  if (extension === '.txt') {
    return [{ pageNumber: 1, text: await fs.readFile(filePath, 'utf8') }];
  }

  if (extension === '.pdf') {
    return extractPdfPages(filePath);
  }

  return [];
};

export const buildDocumentIndex = async ({ filePath, extension }) => {
  const pages = await extractDocumentPages({ filePath, extension });
  const text = normalizeText(pages.map((page) => page.text).join('\n\n'));
  const chunks = pages.flatMap((page) =>
    chunkPage({ text: page.text, pageNumber: page.pageNumber })
  );

  return {
    textPreview: text.slice(0, 1000),
    textLength: text.length,
    chunks: chunks.map((chunk, index) => ({
      ...chunk,
      index: index + 1,
    })),
    extractionStatus: chunks.length > 0 ? 'ready' : 'empty',
  };
};

const documentNeedsReindex = (document) =>
  !Array.isArray(document.chunks) ||
  document.chunks.length === 0 ||
  document.chunks.some((chunk) => !chunk.pageNumber || !chunk.lineStart || !chunk.lineEnd);

const ensureDocumentIndexed = async (document) => {
  if (!documentNeedsReindex(document)) {
    return document;
  }

  try {
    const index = await buildDocumentIndex({
      filePath: document.filePath,
      extension: document.extension,
    });

    return (
      (await Upload.findByIdAndUpdate(
        document._id,
        { ...index, extractionError: '' },
        { new: true, lean: true }
      )) || document
    );
  } catch (error) {
    await Upload.findByIdAndUpdate(document._id, {
      extractionStatus: 'failed',
      extractionError: error.message,
    }).catch(() => undefined);

    return {
      ...document,
      extractionStatus: 'failed',
      extractionError: error.message,
    };
  }
};

const scoreChunk = (chunk, queryTokens) => {
  if (queryTokens.size === 0) {
    return 0;
  }

  const chunkTokens = tokenize(chunk.text);
  let score = 0;

  for (const token of queryTokens) {
    if (chunkTokens.has(token)) {
      score += token.length > 4 ? 2 : 1;
    }
  }

  return score;
};

const createMetadataOnlyDocument = (document) => ({
  id: document.id,
  originalName: document.originalName,
  extension: document.originalName?.includes('.')
    ? `.${document.originalName.split('.').pop().toLowerCase()}`
    : '',
  size: document.size,
  extractionStatus: document.extractionStatus || 'metadata-only',
  textLength: document.textLength || 0,
  textPreview: document.textPreview || '',
  chunks: [],
});

export const getRelevantDocumentContext = async ({
  documentIds = [],
  userId,
  query,
  clientDocuments = [],
}) => {
  const uniqueIds = [...new Set(documentIds.filter(Boolean))].slice(
    0,
    MAX_DOCUMENTS_PER_CHAT
  );

  const storedDocuments =
    uniqueIds.length > 0
      ? await Upload.find({
          _id: { $in: uniqueIds },
          $or: [{ userId }, { userId: { $exists: false } }],
        }).lean()
      : [];
  const indexedDocuments = await Promise.all(storedDocuments.map(ensureDocumentIndexed));
  const storedIds = new Set(indexedDocuments.map((document) => document._id.toString()));
  const metadataDocuments = clientDocuments
    .filter((document) => document?.id && !storedIds.has(document.id))
    .map(createMetadataOnlyDocument);
  const documents = [...indexedDocuments, ...metadataDocuments];
  const queryTokens = tokenize(query);
  const rankedChunks = [];

  for (const document of indexedDocuments) {
    for (const chunk of document.chunks || []) {
      rankedChunks.push({
        documentName: document.originalName,
        chunkIndex: chunk.index,
        pageNumber: chunk.pageNumber || 1,
        lineStart: chunk.lineStart || 1,
        lineEnd: chunk.lineEnd || chunk.lineStart || 1,
        text: chunk.text,
        score: scoreChunk(chunk, queryTokens),
      });
    }
  }

  rankedChunks.sort(
    (a, b) =>
      b.score - a.score ||
      a.documentName.localeCompare(b.documentName) ||
      a.chunkIndex - b.chunkIndex
  );

  const overviewChunks = rankedChunks
    .filter((chunk) => chunk.chunkIndex === 1)
    .slice(0, MAX_DOCUMENTS_PER_CHAT);
  const relevantChunks = rankedChunks.filter((chunk) => chunk.score > 0).slice(0, 8);
  const selected = [...overviewChunks, ...relevantChunks].filter(
    (chunk, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.documentName === chunk.documentName &&
          candidate.chunkIndex === chunk.chunkIndex
      ) === index
  );
  let usedChars = 0;
  const sections = [];

  for (const chunk of selected) {
    const header = `[${chunk.documentName} | หน้า ${chunk.pageNumber} บรรทัด ${chunk.lineStart}-${chunk.lineEnd} | chunk ${chunk.chunkIndex}]`;
    const block = `${header}\n${chunk.text}`;

    if (usedChars + block.length > MAX_CONTEXT_CHARS) {
      break;
    }

    sections.push(block);
    usedChars += block.length;
  }

  return {
    documents: documents.map((document) => ({
      id: document._id?.toString?.() || document.id,
      originalName: document.originalName,
      extractionStatus: document.extractionStatus,
      textLength: document.textLength || 0,
      textPreview: document.textPreview || '',
      size: document.size,
      extension: document.extension,
    })),
    context: sections.join('\n\n---\n\n'),
  };
};
