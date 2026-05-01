import { CHAT_TIMEOUT_MS, streamAiChat } from '../services/aiClient.js';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

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

export const streamChat = async (req, res, next) => {
  let messages;

  try {
    messages = validateMessages(req.body?.messages);
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
