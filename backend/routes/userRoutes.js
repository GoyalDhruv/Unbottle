import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { blockUser, loginUser, registerUser, unblockUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/block/:id', authMiddleware, blockUser);
router.post('/unblock/:id', authMiddleware, unblockUser);

export default router;
