// import User from '../models/UserModel.js';

// const socketHandler = (io) => {
//     io.on('connection', (socket) => {
//         console.log(' New socket connected:', socket.id);

//         socket.on('setup', async (userId) => {
//             try {
//                 const id = JSON.parse(userId).id;
//                 socket.join(id);
//                 console.log(` Setup: User ${id} joined their personal room`);

//                 const user = await User.findById(id);
//                 if (!user) {
//                     console.error(`User not found: ${id}`);
//                     return;
//                 }

//                 await User.findByIdAndUpdate(id, { isOnline: true, socketId: socket.id });
//                 socket.broadcast.emit('user online', id);
//             } catch (error) {
//                 console.error('Error setting up user:', error);
//             }
//         });

//         // Join Chat Event
//         socket.on('join chat', (chatId) => {
//             const id = JSON.parse(chatId).id;
//             socket.join(id);
//             console.log(` Joined chat room: ${id}`);
//         });

//         // Send Message Event
//         socket.on('send message', (newMessage) => {
//             console.log(' send message event:', newMessage);
//             const chat = newMessage.chat;
//             if (!chat?.participants) return;

//             chat.participants.forEach((user) => {
//                 if (user._id === newMessage.sender._id) return;
//                 io.to(user._id).emit('message received', newMessage);
//             });
//         });

//         socket.on('disconnect', async () => {
//             try {
//                 console.log(' Socket disconnected:', socket.id);

//                 if (socket.userId) {
//                     await User.findByIdAndUpdate(socket.userId, { isOnline: false, socketId: null });
//                     console.log(` User ${socket.userId} set offline`);
//                     socket.broadcast.emit('user offline', socket.userId);
//                 }
//             } catch (error) {
//                 console.error('Error disconnecting user:', error);
//             }
//         });

//         socket.onAny((event, ...args) => {
//             console.log(` Event received: ${event}`, args);
//         });
//     });
// };

// export default socketHandler;