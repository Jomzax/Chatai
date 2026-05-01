import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    extension: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    extractionStatus: {
      type: String,
      enum: ['ready', 'empty', 'failed'],
      default: 'empty',
    },
    extractionError: {
      type: String,
      trim: true,
      default: '',
    },
    textPreview: {
      type: String,
      default: '',
    },
    textLength: {
      type: Number,
      default: 0,
      min: 0,
    },
    chunks: [
      {
        _id: false,
        index: Number,
        text: String,
        pageNumber: Number,
        lineStart: Number,
        lineEnd: Number,
        charStart: Number,
        charEnd: Number,
      },
    ],
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Upload = mongoose.models.Upload || mongoose.model('Upload', uploadSchema);

export default Upload;
