import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';
import connectDB from './config/db.js';
import chatRoutes, { setChatIo } from './routes/chat.js';

// Load env vars
dotenv.config();

// Connect to database (optional for demo: server still runs without MongoDB; chat uses in-memory fallback)
connectDB().catch((err) => {
  console.warn('DB not connected, chat will use in-memory storage:', err.message);
});

const app = express();
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
});
app.set('io', io);
setChatIo(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/location.js';
import mushiRoutes from './routes/mushi.js';
import x402Routes from './routes/x402.js';
import soulRoutes from './routes/soul.js';

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/mushi', mushiRoutes);
app.use('/api/x402', x402Routes);
app.use('/api/soul', soulRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mushi Social API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
