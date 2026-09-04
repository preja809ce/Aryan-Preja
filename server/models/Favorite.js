import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create unique index for userId and roomId combination
favoriteSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
