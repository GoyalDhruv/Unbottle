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

        // const token = generateToken(user._id);

        const user = await User.create({ username, password: hashed });


        res.status(201).json({
            _id: user._id,
            username: user.username,
            // token,
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
        await User.findByIdAndUpdate(user._id, { token });

        res.status(200).json({
            _id: user._id,
            username: user.username,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

export const blockUser = async (req, res) => {
    try {

        const { id } = req.params;
        const currentUser = req.user._id;

        if (currentUser.toString() === id) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await User.findById(currentUser);
        if (!user.blockedUsers.includes(id)) {
            user.blockedUsers.push(id);
            await user.save();
            return res.status(200).json({ message: "User blocked successfully" });
        }

        res.status(400).json({ message: "User is already blocked" });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user._id;

        const user = await User.findById(currentUser);
        user.blockedUsers = user.blockedUsers.filter(uid => uid.toString() !== id);
        await user.save();

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
