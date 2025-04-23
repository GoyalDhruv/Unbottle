import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendMessage, getMessagesForChat } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/:chatId', authMiddleware, getMessagesForChat);

export default router;
