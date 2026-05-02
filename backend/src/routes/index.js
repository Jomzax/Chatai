import { Router } from 'express';
import { getSession, login, logout, register } from '../controllers/authController.js';
import { streamChat } from '../controllers/chatController.js';
import {
  createConversation,
  deleteConversation,
  listConversations,
  updateConversation,
} from '../controllers/conversationController.js';
import uploadDocument, { deleteDocument } from '../controllers/uploadController.js';
import { requireAuth } from '../middlewares/auth.js';
import { uploadDocumentMiddleware } from '../middlewares/upload.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is ready' });
});

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/session', getSession);
router.post('/auth/logout', logout);

router.post('/chat/stream', requireAuth, streamChat);
router.get('/conversations', requireAuth, listConversations);
router.post('/conversations', requireAuth, createConversation);
router.patch('/conversations/:id', requireAuth, updateConversation);
router.delete('/conversations/:id', requireAuth, deleteConversation);
router.post('/uploads', requireAuth, uploadDocumentMiddleware, uploadDocument);
router.delete('/uploads/:id', requireAuth, deleteDocument);

export default router;
