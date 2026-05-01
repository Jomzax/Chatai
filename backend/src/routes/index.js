import { Router } from 'express';
import uploadDocument, { deleteDocument } from '../controllers/uploadController.js';
import { uploadDocumentMiddleware } from '../middlewares/upload.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is ready' });
});

router.post('/uploads', uploadDocumentMiddleware, uploadDocument);
router.delete('/uploads/:id', deleteDocument);

export default router;
