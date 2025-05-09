import User from '../models/UserModel.js';
import { verifyToken } from '../utils/auth.js';

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = verifyToken(token);

            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
