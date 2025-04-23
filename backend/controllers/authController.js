import User from '../models/UserModel.js';
import { hashPassword, matchPassword, generateToken } from '../utils/auth.js';

export const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashed = await hashPassword(password);

        const user = await User.create({ username, password: hashed });

        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await matchPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
