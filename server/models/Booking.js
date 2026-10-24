import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moveInDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  occupants: {
    type: Number,
    required: true
  },
  message: String,
  status: {
    type: String,
    enum: ['Pending', 'Payment Required', 'Accepted', 'Rejected', 'Cancelled', 'Confirmed', 'Completed'],
    default: 'Pending'
  },
  paymentDeadline: Date,
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index(
  { roomId: 1, moveInDate: 1 },
  { unique: true, partialFilterExpression: { status: 'Confirmed' } }
);

export default mongoose.model('Booking', bookingSchema);
