import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  message: String,
  type: {
    type: String,
    enum: ['booking', 'message', 'review', 'approval', 'other'],
    default: 'other'
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Notification', notificationSchema);
