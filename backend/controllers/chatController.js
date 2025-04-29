import crypto from 'crypto-js';
import Chat from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import dotenv from 'dotenv';
dotenv.config();

export const accessOrCreateChat = async (req, res) => {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) return res.status(400).json({ message: 'UserId is required' });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    if (
        currentUser.blockedUsers.includes(userId) ||
        targetUser.blockedUsers.includes(currentUserId)
    ) {
        return res.status(403).json({ message: "You cannot chat with this user" });
    }

    try {
        let chat = await Chat.findOne({
            participants: { $all: [currentUserId, userId], $size: 2 },
        }).populate('participants', 'username _id').populate('lastMessage');

        if (chat) return res.status(200).json({ message: 'Chat found', chat });

        const newChat = await Chat.create({
            participants: [currentUserId, userId],
        });

        const fullChat = await Chat.findById(newChat._id).populate('participants', 'username _id');
        res.status(201).json({ message: 'Chat created successfully', chat: fullChat });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id,
        })
            .populate('participants', 'username _id')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        const decryptedContent = chats.map((chat) => {
            if (chat?.lastMessage?.content) {
                const newContent = crypto.AES.decrypt(chat.lastMessage.content, process.env.MSG_SECRET).toString(crypto.enc.Utf8)
                return { ...chat.toObject(), lastMessage: { ...chat.lastMessage.toObject(), content: newContent } };
            } else {
                return { ...chat.toObject(), lastMessage: null };
            }
        });

        if (chats?.length === 0) return res.status(404).json({ message: 'No chats found' });

        res.status(200).json({ message: 'Chats fetched successfully', chats: decryptedContent });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch chats', error });
    }
};
