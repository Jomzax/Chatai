import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, trim: true, default: '' },
    mimeType: { type: String, trim: true, default: '' },
    size: { type: Number, min: 0, default: 0 },
    uploadedAt: { type: Date },
    extractionStatus: {
      type: String,
      enum: ['ready', 'empty', 'failed'],
    },
    textLength: { type: Number, min: 0, default: 0 },
    textPreview: { type: String, default: '' },
    url: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: { type: String, default: '' },
    status: {
      type: String,
      enum: ['streaming', 'done', 'error'],
      default: 'done',
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New chat',
      maxlength: 120,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    titleEdited: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', conversationSchema);

export default Conversation;
