import crypto from 'crypto-js';
import Message from '../models/MessageModel.js';
import Chat from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import dotenv from 'dotenv';
dotenv.config();


export const sendMessage = async (req, res) => {
    const { chatId, content } = req.body;
    const sender = req.user.id;

    if (!chatId || !content) {
        return res.status(400).json({ message: 'Chat ID and content are required' });
    }

    const isUserInChat = await Chat.findOne({ _id: chatId, participants: { $in: [sender] } });
    if (!isUserInChat) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    try {
        const chat = await Chat.findById(chatId).populate('participants', '_id blockedUsers');
        if (!chat || !chat.participants.some(p => p._id.toString() === sender)) {
            return res.status(403).json({ message: 'You are not a participant in this chat' });
        }

        const receiver = chat.participants.find(p => p._id.toString() !== sender);
        if (!receiver) {
            return res.status(400).json({ message: 'Could not identify recipient in chat' });
        }

        const senderUser = chat.participants.find(p => p._id.toString() === sender);
        if (
            senderUser.blockedUsers.includes(receiver._id) ||
            receiver.blockedUsers.includes(sender)
        ) {
            return res.status(403).json({ message: 'You cannot send messages to this user' });
        }

        const encryptedContent = crypto.AES.encrypt(content, process.env.MSG_SECRET).toString();

        const message = await Message.create({
            sender,
            chat: chatId,
            content: encryptedContent,
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username _id');

        const decryptedContent = crypto.AES.decrypt(message.content, process.env.MSG_SECRET).toString(crypto.enc.Utf8);
        populatedMessage.content = decryptedContent;

        res.status(201).json({ message: 'Message sent successfully', message: populatedMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message', error });
    }
};

export const getMessagesForChat = async (req, res) => {
    const { chatId } = req.params;

    try {
        const isUserInChat = await Chat.findOne({ _id: chatId, participants: { $in: [req.user.id] } });
        if (!isUserInChat) {
            return res.status(403).json({ message: 'You are not a participant in this chat' });
        }

        const getUsers = await Chat.findOne({ _id: chatId }).populate('participants', 'username _id isOnline');
        // check is the user blocked or not 
        const [userId1, userId2] = getUsers?.participants?.map(p => p._id.toString());

        const [user1, user2] = await Promise.all([
            User.findById(userId1),
            User.findById(userId2)
        ]);

        let blockedDetails = {
            blocked: false,
            blockedBy: null,
            blockedUser: null,
            blockedByUsername: null,
        };

        if (user1?.blockedUsers?.includes(userId2)) {
            blockedDetails = {
                blocked: true,
                blockedBy: userId1,
                blockedUser: userId2,
                blockedByUsername: user1.username,
            };
        }
        else if (user2?.blockedUsers?.includes(userId1)) {
            blockedDetails = {
                blocked: true,
                blockedBy: userId2,
                blockedUser: userId1,
                blockedByUsername: user2.username,
            };
        }

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'username _id')
            .sort({ createdAt: 1 });

        const decryptedMessages = messages.map((message) => {
            const decryptedContent = crypto.AES.decrypt(message.content, process.env.MSG_SECRET).toString(crypto.enc.Utf8);
            return { ...message.toObject(), content: decryptedContent };
        });

        res.status(200).json({
            message: 'Messages fetched successfully',
            messages: { users: getUsers, decryptedMessages, blockedDetails }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages', error });
    }
};