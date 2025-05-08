import ChatModel from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import crypto from 'crypto-js';
import MessageModel from '../models/MessageModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userSocketMap = new Map();

const socketHandler = (io) => {
    // Middleware to authenticate socket
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) return next(new Error('Authentication error'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
            socket.to(chatId).emit('typing', { userId });
        });

        socket.on('stop_typing', ({ chatId }) => {
            socket.to(chatId).emit('stop_typing', { userId });
        });

        socket.on('messages_seen', async ({ messageIds = [], chatId }) => {
            try {
                if (messageIds.length === 0) return;

                const userId = socket.userId;

                // Only update messages that were sent by someone else
                await MessageModel.updateMany(
                    {
                        _id: { $in: messageIds },
                        sender: { $ne: userId }, // Not sent by current user
                    },
                    { $set: { isSeen: true } }
                );

                // Fetch updated messages to emit
                const updatedMessages = await MessageModel.find({
                    _id: { $in: messageIds },
                    sender: { $ne: userId }
                }).populate('sender', '_id username');

                const decryptedMessages = updatedMessages.map((message) => ({
                    ...message.toObject(),
                    content: crypto.AES.decrypt(message.content, process.env.MSG_SECRET).toString(crypto.enc.Utf8),
                }));

                io.to(chatId).emit('messages_seen_update', decryptedMessages);

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
                    encryptedContent = crypto.AES.encrypt(content, process.env.MSG_SECRET).toString();
                } else if (type === 'media') {
                    encryptedMedia = media.map(({ url, type, caption }) => ({
                        url,
                        type,
                        caption: caption
                            ? crypto.AES.encrypt(caption, process.env.MSG_SECRET).toString()
                            : '',
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
                    populatedMessage.content = crypto.AES.decrypt(
                        populatedMessage.content,
                        process.env.MSG_SECRET
                    ).toString(crypto.enc.Utf8);
                } else if (populatedMessage.type === 'media') {
                    populatedMessage.media = populatedMessage.media.map(({ url, type, caption }) => ({
                        url,
                        type,
                        caption: caption
                            ? crypto.AES.decrypt(caption, process.env.MSG_SECRET).toString(crypto.enc.Utf8)
                            : '',
                    }));
                }

                io.to(chatId).emit('message_received', populatedMessage);

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

