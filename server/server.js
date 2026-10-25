import app from './app.js';
import { connectDatabase, mongoose } from './database.js';

// Start the API only after the database is ready.
const startServer = async () => {
  try {
    await connectDatabase();
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
