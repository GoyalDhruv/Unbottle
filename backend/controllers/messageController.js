import Message from '../models/MessageModel.js';
import Chat from '../models/ChatModel.js';

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
        const message = await Message.create({
            sender,
            chat: chatId,
            content,
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username _id')
        // .populate('chat');

        res.status(201).json(populatedMessage);
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
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'username _id')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages', error });
    }
};
