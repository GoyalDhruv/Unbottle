import Message from '../models/MessageModel.js';
import Chat from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import { decryptMsg, encryptMsg } from '../utils/cryptoUtils.js';

export const sendMessage = async (req, res) => {
    const { chatId, content, media = [], type } = req.body;
    const sender = req.user.id;

    if (!chatId || !type || (type === 'text' && !content) || (type === 'media' && media.length === 0)) {
        return res.status(400).json({ message: 'Invalid payload: missing required fields.' });
    }

    const isUserInChat = await Chat.findOne({ _id: chatId, participants: { $in: [sender] } });
    if (!isUserInChat) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    try {
        const chat = await Chat.findById(chatId).populate('participants', '_id blockedUsers');
        const receiver = chat.participants.find(p => p._id.toString() !== sender);
        const senderUser = chat.participants.find(p => p._id.toString() === sender);

        if (
            senderUser.blockedUsers.includes(receiver._id) ||
            receiver.blockedUsers.includes(sender)
        ) {
            return res.status(403).json({ message: 'You cannot send messages to this user' });
        }

        let encryptedContent = '';
        if (type === 'text') {
            encryptedContent = encryptMsg(content);
        }

        let encryptedMedia = [];
        if (type === 'media') {
            encryptedMedia = media.map(({ url, type, caption }) => ({
                url,
                type,
                caption: caption
                    ? encryptMsg(content)
                    : '',
            }));
        }

        const message = await Message.create({
            sender,
            chat: chatId,
            content: encryptedContent,
            media: encryptedMedia,
            type,
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        const populatedMessage = await Message.findById(message._id).populate('sender', 'username _id');

        if (populatedMessage.type === 'text') {
            populatedMessage.content = decryptMsg(populatedMessage.content)
        } else if (populatedMessage.type === 'media') {
            populatedMessage.media = populatedMessage.media.map(({ url, type, caption }) => ({
                url,
                type,
                caption: caption
                    ? decryptMsg(caption)
                    : '',
            }));
        }

        res.status(201).json({ message: 'Message sent successfully', message: populatedMessage });

    } catch (error) {
        console.error('Send message error:', error);
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
            if (message.type === 'text') {
                const decryptedContent = decryptMsg(message.content);
                return { ...message.toObject(), content: decryptedContent };
            }
            else if (message?.type === 'media') {
                const decryptedMedia = message.media.map(({ url, type, caption }) => ({
                    url,
                    type,
                    caption: caption
                        ? decryptMsg(caption)
                        : '',
                }));
                return { ...message.toObject(), media: decryptedMedia };
            }
        })

        res.status(200).json({
            message: 'Messages fetched successfully',
            messages: { users: getUsers, decryptedMessages, blockedDetails }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages', error });
    }
};