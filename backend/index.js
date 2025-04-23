import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';
// import socketHandler from './socket/index.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
// const io = new SocketServer(server, {
//     cors: { origin: '*' }
// });

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/v1/user', userRoutes);
// app.use('/api/chat', chatRoutes);

// socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
