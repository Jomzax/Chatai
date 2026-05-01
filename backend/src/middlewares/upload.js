import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt']);
const ALLOWED_MIME_TYPES = {
  '.pdf': new Set(['application/pdf']),
  '.txt': new Set(['text/plain']),
};

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const decodeOriginalName = (filename) => {
  try {
    return Buffer.from(filename, 'latin1').toString('utf8');
  } catch {
    return filename;
  }
};

const sanitizeFileStem = (filename) => {
  const stem = path.parse(path.basename(filename)).name;

  return (
    stem
      .normalize('NFKD')
      .replace(/[^\w.-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-_.]+|[-_.]+$/g, '')
      .toLowerCase() || 'file'
  );
};

const createSafeFilename = (originalName) => {
  const decodedName = decodeOriginalName(originalName);
  const basename = path.basename(decodedName);
  const extension = path.extname(basename).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw createHttpError('Only PDF and TXT files are allowed.');
  }

  const storedName = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFileStem(
    basename
  )}${extension}`;
  const targetPath = path.resolve(UPLOADS_DIR, storedName);
  const uploadsRoot = `${UPLOADS_DIR}${path.sep}`;

  if (!targetPath.startsWith(uploadsRoot)) {
    throw createHttpError('Invalid upload path.');
  }

  return { decodedName: basename, extension, storedName };
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    try {
      const { decodedName, extension, storedName } = createSafeFilename(file.originalname);
      file.decodedOriginalName = decodedName;
      file.safeExtension = extension;
      cb(null, storedName);
    } catch (error) {
      cb(error);
    }
  },
});

const fileFilter = (req, file, cb) => {
  try {
    const decodedOriginalName = decodeOriginalName(file.originalname);
    const extension = path
      .extname(path.basename(decodedOriginalName))
      .toLowerCase();
    const allowedMimeTypes = ALLOWED_MIME_TYPES[extension];

    if (!ALLOWED_EXTENSIONS.has(extension) || !allowedMimeTypes?.has(file.mimetype)) {
      return cb(createHttpError('Invalid file type. Please upload a PDF or TXT file.'));
    }

    cb(null, true);
  } catch (error) {
    cb(error);
  }
};

const uploadSingle = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
}).single('file');

export const uploadDocumentMiddleware = (req, res, next) => {
  uploadSingle(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File is too large. Maximum size is 5 MB.',
        });
      }

      return res.status(400).json({
        message: 'Upload failed. Please choose one PDF or TXT file.',
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  });
};
