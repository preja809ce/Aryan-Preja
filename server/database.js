import mongoose from 'mongoose';

let connectionPromise;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || (process.env.VERCEL
    ? ''
    : 'mongodb://127.0.0.1:27017/room-rental-system');

  if (!mongoUri) {
    throw new Error('MONGO_URI must be configured for the deployed application.');
  }

  if (!connectionPromise || mongoose.connection.readyState === 0) {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
};

export { mongoose };
