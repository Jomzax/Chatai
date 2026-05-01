import mongoose from 'mongoose';
import { CHAT_TIMEOUT_MS, streamAiChat } from '../services/aiClient.js';
import { getRelevantDocumentContext } from '../services/documentContext.js';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_DOCUMENT_IDS = 5;

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createHttpError('Please send at least one chat message.');
  }

  if (messages.length > MAX_MESSAGES) {
    throw createHttpError(`Please send no more than ${MAX_MESSAGES} messages.`);
  }

  return messages.map((message) => {
    const role = message?.role;
    const content = String(message?.content || '').trim();

    if (!['user', 'assistant'].includes(role)) {
      throw createHttpError('Invalid chat message role.');
    }

    if (!content) {
      throw createHttpError('Chat message content is required.');
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw createHttpError(`Chat messages must be ${MAX_MESSAGE_LENGTH} characters or less.`);
    }

    return { role, content };
  });
};

const validateDocumentIds = (documentIds) => {
  if (documentIds === undefined) {
    return [];
  }

  if (!Array.isArray(documentIds)) {
    throw createHttpError('documentIds must be an array.');
  }

  return documentIds
    .map((id) => String(id || '').trim())
    .filter(Boolean)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .slice(0, MAX_DOCUMENT_IDS);
};

const validateClientDocuments = (documents) => {
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents
    .map((document) => ({
      id: String(document?.id || '').trim(),
      originalName: String(document?.originalName || '').trim(),
      size: Number(document?.size || 0),
      extractionStatus: document?.extractionStatus,
      textLength: Number(document?.textLength || 0),
      textPreview: String(document?.textPreview || '').slice(0, 1000),
    }))
    .filter((document) => document.id && document.originalName)
    .slice(0, MAX_DOCUMENT_IDS);
};

const addDocumentContextToMessages = ({ messages, context, documents }) => {
  if (!context && documents.length === 0) {
    return messages;
  }

  const documentList = documents
    .map(
      (document) =>
        `- ${document.originalName} (${document.extension || 'file'}, ${document.size || 0} bytes, extraction: ${document.extractionStatus || 'unknown'}, indexed chars: ${document.textLength || 0})`
    )
    .join('\n');
  const documentPreviews = documents
    .map((document) => {
      const preview = String(document.textPreview || '').trim();
      return preview
        ? `[${document.originalName} | overview]\n${preview}`
        : `[${document.originalName} | overview]\nNo readable text preview was extracted.`;
    })
    .join('\n\n');
  const lastUserIndex = messages.findLastIndex((message) => message.role === 'user');

  if (lastUserIndex === -1) {
    return messages;
  }

  return messages.map((message, index) => {
    if (index !== lastUserIndex) {
      return message;
    }

    return {
      ...message,
      content: [
        'DOCUMENT_CONTEXT_START',
        'Use this uploaded file context silently as part of the conversation. These are the only target files for the current user question.',
        'Do not answer from other uploaded files unless they are listed in this context.',
        'If the user asks what file was uploaded, answer from Uploaded files and Document overview.',
        'If answering from document contents, cite sources in Thai format: อ้างอิง: หน้า X บรรทัด Y-Z',
        'If the answer is not found in the context, say it was not found in the uploaded document context.',
        '',
        'Uploaded files:',
        documentList || 'No uploaded file metadata was provided.',
        '',
        'Document overview:',
        documentPreviews || 'No document overview is available.',
        '',
        context ? 'Relevant excerpts:' : 'Relevant excerpts: none available.',
        context || 'No readable text excerpts are available for these files.',
        'DOCUMENT_CONTEXT_END',
        '',
        'User question:',
        message.content,
      ].join('\n'),
    };
  });
};

export const streamChat = async (req, res, next) => {
  let messages;
  let documentIds;
  let clientDocuments;

  try {
    messages = validateMessages(req.body?.messages);
    documentIds = validateDocumentIds(req.body?.documentIds);
    clientDocuments = validateClientDocuments(req.body?.documents);
  } catch (error) {
    return next(error);
  }

  try {
    if (documentIds.length > 0 || clientDocuments.length > 0) {
      const latestUserMessage =
        [...messages].reverse().find((message) => message.role === 'user')?.content || '';
      const documentContext = await getRelevantDocumentContext({
        documentIds,
        userId: req.user.id,
        query: latestUserMessage,
        clientDocuments,
      });

      messages = addDocumentContextToMessages({
        messages,
        context: documentContext.context,
        documents: documentContext.documents,
      });
    }
  } catch (error) {
    return next(error);
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, CHAT_TIMEOUT_MS);

  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  try {
    await streamAiChat({
      messages,
      signal: abortController.signal,
      onChunk: (chunk) => {
        res.write(chunk);
      },
    });
  } catch (error) {
    if (!res.writableEnded) {
      const message =
        abortController.signal.aborted || error.name === 'AbortError'
          ? '\n\n[The AI response timed out. Please try again.]'
          : '\n\n[The AI response failed. Please try again.]';
      res.write(message);
    }
  } finally {
    clearTimeout(timeout);

    if (!res.writableEnded) {
      res.end();
    }
  }
};
