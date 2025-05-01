import ChatModel from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import crypto from 'crypto-js';
import MessageModel from '../models/MessageModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userSocketMap = new Map();

const getSocketIdByUserId = (userId) => userSocketMap.get(userId);

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
        socket.broadcast.emit('user_online', userId);

        // Send Message Event
        socket.on('send_message', async (newChat) => {
            try {
                const { chatId, senderId, content } = newChat;
                console.log('📨 send message event:', { chatId, senderId, content });

                const chat = await ChatModel.findById(chatId).populate('participants', '_id username');
                if (!chat) return console.log('⚠️ Chat not found');

                const isParticipant = chat.participants.some(p => p._id.toString() === senderId);
                if (!isParticipant) return console.log('🚫 Sender is not in this chat');

                const encryptedContent = crypto.AES.encrypt(content, process.env.MSG_SECRET).toString();

                const newMessage = await MessageModel.create({
                    sender: senderId,
                    chat: chatId,
                    content: encryptedContent,
                });

                await ChatModel.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

                const populatedMessage = await MessageModel.findById(newMessage._id)
                    .populate('sender', '_id username');

                const decryptedContent = crypto.AES.decrypt(populatedMessage.content, process.env.MSG_SECRET).toString(crypto.enc.Utf8);
                populatedMessage.content = decryptedContent;

                // Emit to all participants except sender
                chat.participants.forEach((user) => {
                    const userIdStr = user._id.toString();
                    const socketId = getSocketIdByUserId(userIdStr);

                    if (socketId) {
                        io.to(socketId).emit('message_received', populatedMessage);
                    } else {
                        console.log(`⚠️ Socket ID not found for user ${userIdStr}`);
                    }
                });

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

        // Logging all events
        socket.onAny((event, ...args) => {
            console.log(`📡 Event received: ${event}`, args);
        });
    });
};

export default socketHandler;
