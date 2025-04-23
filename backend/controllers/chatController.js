import Chat from '../models/ChatModel.js';

export const accessOrCreateChat = async (req, res) => {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) return res.status(400).json({ message: 'UserId is required' });

    try {
        let chat = await Chat.findOne({
            participants: { $all: [currentUserId, userId], $size: 2 },
        }).populate('participants', 'username _id').populate('lastMessage');

        if (chat) return res.status(200).json(chat);

        const newChat = await Chat.create({
            participants: [currentUserId, userId],
        });

        const fullChat = await Chat.findById(newChat._id).populate('participants', 'username _id');
        res.status(201).json(fullChat);
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

        if (chats?.length === 0) return res.status(404).json({ message: 'No chats found' });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch chats', error });
    }
};
