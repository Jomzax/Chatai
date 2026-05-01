import fs from 'fs/promises';
import path from 'path';
import Upload from '../models/upload.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DEFAULT_TTL_HOURS = 24;
const DEFAULT_INTERVAL_MINUTES = 30;

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const ttlHours = parsePositiveNumber(
  process.env.UPLOAD_TTL_HOURS,
  DEFAULT_TTL_HOURS
);
const cleanupIntervalMinutes = parsePositiveNumber(
  process.env.UPLOAD_CLEANUP_INTERVAL_MINUTES,
  DEFAULT_INTERVAL_MINUTES
);

const getCutoffDate = () => new Date(Date.now() - ttlHours * 60 * 60 * 1000);

const isInsideUploadsDir = (filePath) => {
  const targetPath = path.resolve(filePath);
  const uploadsRoot = `${UPLOADS_DIR}${path.sep}`;
  return targetPath.startsWith(uploadsRoot);
};

const removeFile = async (filePath) => {
  if (!isInsideUploadsDir(filePath)) {
    return;
  }

  await fs.unlink(filePath).catch((error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
};

export const cleanupExpiredUploads = async () => {
  const cutoff = getCutoffDate();
  const expiredDocuments = await Upload.find({ uploadedAt: { $lt: cutoff } });

  for (const document of expiredDocuments) {
    await removeFile(document.filePath);
    await document.deleteOne();
  }

  const storedNames = new Set(
    (await Upload.find({}, { storedName: 1 })).map((document) => document.storedName)
  );
  const uploadFiles = await fs.readdir(UPLOADS_DIR, { withFileTypes: true }).catch(() => []);

  for (const entry of uploadFiles) {
    if (!entry.isFile() || entry.name === '.gitkeep' || storedNames.has(entry.name)) {
      continue;
    }

    const filePath = path.join(UPLOADS_DIR, entry.name);
    const stat = await fs.stat(filePath).catch(() => null);

    if (stat && stat.mtime < cutoff) {
      await removeFile(filePath);
    }
  }

  return expiredDocuments.length;
};

export const startUploadCleanupJob = () => {
  const intervalMs = cleanupIntervalMinutes * 60 * 1000;

  cleanupExpiredUploads().catch((error) => {
    console.error('Initial upload cleanup failed', error);
  });

  const timer = setInterval(() => {
    cleanupExpiredUploads().catch((error) => {
      console.error('Upload cleanup failed', error);
    });
  }, intervalMs);

  timer.unref?.();
};
