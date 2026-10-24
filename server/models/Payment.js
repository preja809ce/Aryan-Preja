import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['Created', 'Paid', 'Failed'],
    default: 'Created'
  },
  paidAt: Date
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
