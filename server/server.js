import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the server's environment file regardless of the current working directory.
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

// Start the API only after the database is ready.
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/room-rental-system', {
      serverSelectionTimeoutMS: 5000
    });
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    console.error('Set MONGO_URI in server/.env and make sure MongoDB is running and reachable.');
    process.exitCode = 1;
    return;
  }

  console.log('✓ MongoDB connected');
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Server is already running at http://localhost:${PORT}. Reuse it, or stop it before starting another instance.`);
      await mongoose.disconnect();
      return;
    }

    console.error('✗ Server failed to start:', err.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
};

startServer();
