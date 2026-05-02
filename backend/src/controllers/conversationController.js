import mongoose from 'mongoose';
import Conversation from '../models/conversation.js';

const MAX_CONVERSATIONS = 100;
const MAX_MESSAGES = 80;
const MAX_MESSAGE_LENGTH = 12000;
const MAX_ATTACHMENTS = 5;
const DEFAULT_TITLE = 'New chat';

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toTimestamp = (value) => new Date(value).getTime();

const serializeConversation = (conversation) => ({
  id: conversation.id,
  title: conversation.title,
  messages: (conversation.messages || []).map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    status: message.status === 'streaming' ? 'done' : message.status,
    attachments: message.attachments || [],
  })),
  createdAt: toTimestamp(conversation.createdAt),
  updatedAt: toTimestamp(conversation.updatedAt),
  titleEdited: Boolean(conversation.titleEdited),
});

const sanitizeTitle = (title) => {
  const value = String(title || '').trim();
  return (value || DEFAULT_TITLE).slice(0, 120);
};

const sanitizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .map((attachment) => ({
      id: String(attachment?.id || '').trim(),
      originalName: String(attachment?.originalName || '').trim(),
      storedName: String(attachment?.storedName || '').trim(),
      mimeType: String(attachment?.mimeType || '').trim(),
      size: Math.max(0, Number(attachment?.size || 0)),
      uploadedAt: attachment?.uploadedAt ? new Date(attachment.uploadedAt) : undefined,
      extractionStatus: ['ready', 'empty', 'failed'].includes(attachment?.extractionStatus)
        ? attachment.extractionStatus
        : undefined,
      textLength: Math.max(0, Number(attachment?.textLength || 0)),
      textPreview: '',
      url: String(attachment?.url || '').trim(),
    }))
    .filter((attachment) => attachment.id && attachment.originalName)
    .slice(0, MAX_ATTACHMENTS);
};

const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.slice(-MAX_MESSAGES).map((message) => {
    const role = message?.role;
    const content = String(message?.content || '').slice(0, MAX_MESSAGE_LENGTH);

    if (!['user', 'assistant'].includes(role)) {
      throw createHttpError('Invalid conversation message role.');
    }

    return {
      id: String(message?.id || new mongoose.Types.ObjectId().toString()),
      role,
      content,
      status: ['streaming', 'done', 'error'].includes(message?.status)
        ? message.status
        : 'done',
      attachments: sanitizeAttachments(message?.attachments),
    };
  });
};

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(MAX_CONVERSATIONS);

    return res.json({
      conversations: conversations.map(serializeConversation),
    });
  } catch (error) {
    return next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.create({
      userId: req.user.id,
      title: sanitizeTitle(req.body?.title),
      messages: sanitizeMessages(req.body?.messages),
      titleEdited: Boolean(req.body?.titleEdited),
    });

    return res.status(201).json({
      conversation: serializeConversation(conversation),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (req.body?.title !== undefined) {
      conversation.title = sanitizeTitle(req.body.title);
    }

    if (req.body?.messages !== undefined) {
      conversation.messages = sanitizeMessages(req.body.messages);
    }

    if (req.body?.titleEdited !== undefined) {
      conversation.titleEdited = Boolean(req.body.titleEdited);
    }

    await conversation.save();

    return res.json({
      conversation: serializeConversation(conversation),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    await conversation.deleteOne();

    return res.json({ message: 'Conversation deleted.' });
  } catch (error) {
    return next(error);
  }
};
