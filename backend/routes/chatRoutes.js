import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { accessOrCreateChat, getUserChats } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', authMiddleware, accessOrCreateChat);
router.get('/', authMiddleware, getUserChats);

export default router;
