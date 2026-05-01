import fs from 'fs/promises';
import path from 'path';
import Upload from '../models/upload.js';
import { buildDocumentIndex } from '../services/documentContext.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const removeStoredFile = async (filePath) => {
  const targetPath = path.resolve(filePath);
  const uploadsRoot = `${UPLOADS_DIR}${path.sep}`;

  if (!targetPath.startsWith(uploadsRoot)) {
    return;
  }

  await fs.unlink(targetPath).catch((error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
};

const uploadDocument = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'Please choose a PDF or TXT file to upload.',
    });
  }

  try {
    const originalName = path.basename(
      req.file.decodedOriginalName || req.file.originalname
    );
    let documentIndex;

    try {
      documentIndex = await buildDocumentIndex({
        filePath: req.file.path,
        extension: req.file.safeExtension || path.extname(originalName).toLowerCase(),
      });
    } catch (error) {
      documentIndex = {
        textPreview: '',
        textLength: 0,
        chunks: [],
        extractionStatus: 'failed',
        extractionError: error.message,
      };
    }

    const document = await Upload.create({
      originalName,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      extension: req.file.safeExtension || path.extname(originalName).toLowerCase(),
      size: req.file.size,
      filePath: req.file.path,
      userId: req.user.id,
      ...documentIndex,
    });

    return res.status(201).json({
      message: 'File uploaded successfully.',
      file: {
        id: document.id,
        originalName: document.originalName,
        storedName: document.storedName,
        mimeType: document.mimeType,
        size: document.size,
        uploadedAt: document.uploadedAt,
        extractionStatus: document.extractionStatus,
        textLength: document.textLength,
        textPreview: document.textPreview,
        url: `${req.protocol}://${req.get('host')}/uploads/${document.storedName}`,
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Upload.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: 'File not found.' });
    }

    await removeStoredFile(document.filePath);
    await document.deleteOne();

    return res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

export default uploadDocument;
