import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { blockUser, getNearbyUsers, loginUser, logoutUser, registerUser, unblockUser, updateUserLocation } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/block/:id', authMiddleware, blockUser);
router.post('/unblock/:id', authMiddleware, unblockUser);
router.get('/nearby', authMiddleware, getNearbyUsers);
router.put('/updateUserLocation', authMiddleware, updateUserLocation);
router.post('/logout', authMiddleware, logoutUser);

export default router;
