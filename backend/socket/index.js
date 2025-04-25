import ChatModel from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import crypto from 'crypto-js';
import MessageModel from '../models/MessageModel.js';

const userSocketMap = {};

const getSocketIdByUserId = (userId) => userSocketMap[userId];

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New socket connected:', socket.id);

        // Register user and map socket ID
        socket.on('register', async (userId) => {
            try {
                if (!userId) return;

                const userIdStr = userId.userId?.toString();
                if (!userIdStr) return;

                userSocketMap[userIdStr] = socket.id;
                socket.userId = userIdStr;

                console.log(`✅ Registered user ${userIdStr} with socket ID ${socket.id}`);

                await User.findByIdAndUpdate(userIdStr, { isOnline: true, socketId: socket.id });

                socket.broadcast.emit('user_online', userIdStr);
            } catch (error) {
                console.error('❌ Error registering user:', error);
            }
        });

        // Send Message Event
        socket.on('send_message', async (newChat) => {
            try {
                const { chatId, senderId, content } = newChat;
                console.log('📨 send message event:', { chatId, senderId, content });

                const chat = await ChatModel.findById(chatId).populate('participants', '_id username');
                if (!chat) {
                    console.log('⚠️ Chat not found');
                    return;
                }

                const isParticipant = chat.participants.some(p => p._id.toString() === senderId);
                if (!isParticipant) {
                    console.log('🚫 Sender is not in this chat');
                    return;
                }

                const encryptedContent = crypto.AES.encrypt(content, process.env.MSG_SECRET).toString();

                const newMessage = await MessageModel.create({
                    sender: senderId,
                    chat: chatId,
                    content: encryptedContent,
                });

                await ChatModel.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

                const populatedMessage = await MessageModel.findById(newMessage._id)
                    .populate('sender', '_id username');

                // Emit message to all other participants
                chat.participants.forEach((user) => {
                    const userIdStr = user._id.toString();

                    if (userIdStr === senderId) return;

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

        // Disconnect event
        socket.on('disconnect', async () => {
            try {
                console.log('❌ Socket disconnected:', socket.id);

                if (socket.userId) {
                    delete userSocketMap[socket.userId];
                    await User.findByIdAndUpdate(socket.userId, { isOnline: false, socketId: null });
                    console.log(`⛔️ User ${socket.userId} set offline`);
                    socket.broadcast.emit('user offline', socket.userId);
                }
            } catch (error) {
                console.error('❌ Error during disconnect:', error);
            }
        });

        socket.onAny((event, ...args) => {
            console.log(`📡 Event received: ${event}`, args);
        });
    });
};

export default socketHandler;
