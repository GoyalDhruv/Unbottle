import ChatModel from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import MessageModel from '../models/MessageModel.js';
import { decryptMsg, encryptMsg } from '../utils/cryptoUtils.js';
import { verifyToken } from '../utils/auth.js';

const userSocketMap = new Map();

const socketHandler = (io) => {
    // Middleware to authenticate socket
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) return next(new Error('Authentication error'));

            const decoded = verifyToken(token);
            socket.userId = decoded.id;

            next();
        } catch (error) {
            console.error('Socket auth failed:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        console.log('🔌 New socket connected:', socket.id, 'for user:', userId);

        // Register socket
        userSocketMap.set(userId, socket.id);
        await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

        console.log('Online users:', [...userSocketMap.keys()]);

        socket.broadcast.emit('user_online', userId);

        // Join Chat Room
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`✅ User ${userId} joined chat room ${chatId}`);
        });

        // Typing Events
        socket.on('typing', ({ chatId }) => {
            socket.to(chatId).emit('typing', { userId, chatId });
        });

        socket.on('stop_typing', ({ chatId }) => {
            socket.to(chatId).emit('stop_typing', { userId, chatId });
        });

        socket.on('messages_seen', async ({ messageIds = [], chatId }) => {
            try {
                if (messageIds.length === 0) return;

                const userId = socket.userId;

                await MessageModel.updateMany(
                    {
                        _id: { $in: messageIds },
                        sender: { $ne: userId },
                    },
                    { $set: { isSeen: true } }
                );

                const updatedMessages = await MessageModel.find({
                    _id: { $in: messageIds },
                    sender: { $ne: userId }
                }).populate('sender', '_id username');

                const decryptedMessages = updatedMessages.map((message) => {
                    const decryptedMessage = { ...message._doc };

                    if (message.type === 'text') {
                        decryptedMessage.content = decryptMsg(message.content);
                    } else if (message.type === 'media') {
                        decryptedMessage.media = message.media.map(({ url, type, caption }) => ({
                            url,
                            type,
                            caption: caption ? decryptMsg(caption) : '',
                        }));
                    }

                    return decryptedMessage;
                });

                io.to(chatId).emit('messages_seen_update', { decryptedMessages, chatId });

            } catch (error) {
                console.error('❌ Error in messages_seen event:', error);
            }
        });

        socket.on('send_message', async (newChat) => {
            try {
                const { chatId, senderId, content, media = [], type } = newChat;
                console.log('📨 send message event:', { chatId, senderId, content, media, type });

                const chat = await ChatModel.findById(chatId).populate('participants', '_id username blockedUsers');
                if (!chat) return console.log('⚠️ Chat not found');

                const isParticipant = chat.participants.some(p => p._id.toString() === senderId);
                if (!isParticipant) return console.log('🚫 Sender is not in this chat');

                const receiver = chat.participants.find(p => p._id.toString() !== senderId);
                const senderUser = chat.participants.find(p => p._id.toString() === senderId);

                if (
                    senderUser.blockedUsers.includes(receiver._id) ||
                    receiver.blockedUsers.includes(senderId)
                ) {
                    return console.log('🚫 Message blocked due to block status');
                }

                let encryptedContent = '';
                let encryptedMedia = [];

                if (type === 'text') {
                    encryptedContent = encryptMsg(content);
                } else if (type === 'media') {
                    encryptedMedia = media.map(({ url, type, caption }) => ({
                        url,
                        type,
                        caption: caption
                            ? encryptMsg(caption) : '',
                    }));
                }

                const newMessage = await MessageModel.create({
                    sender: senderId,
                    chat: chatId,
                    content: encryptedContent,
                    media: encryptedMedia,
                    type,
                });

                await ChatModel.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

                const populatedMessage = await MessageModel.findById(newMessage._id)
                    .populate('sender', '_id username');

                if (populatedMessage.type === 'text') {
                    populatedMessage.content = decryptMsg(populatedMessage.content);
                } else if (populatedMessage.type === 'media') {
                    populatedMessage.media = populatedMessage.media.map(({ url, type, caption }) => ({
                        url,
                        type,
                        caption: caption
                            ? decryptMsg(caption)
                            : '',
                    }));
                }

                io.to(chatId).emit('message_received', { populatedMessage, chatId });

            } catch (error) {
                console.error('❌ Error in send_message event:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            try {
                console.log('❌ Socket disconnected:', socket.id);

                if (userId) {
                    userSocketMap.delete(userId);
                    await User.findByIdAndUpdate(userId, { isOnline: false, socketId: null });
                    socket.broadcast.emit('user_offline', userId);
                    console.log(`⛔️ User ${userId} set offline`);
                }
            } catch (error) {
                console.error('❌ Error during disconnect:', error);
            }
        });

        // Log all socket events
        socket.onAny((event, ...args) => {
            console.log(`📡 Event received: ${event}`, args);
        });
    });
};

export default socketHandler;

