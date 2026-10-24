import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

const getPaymentSummary = (booking) => {
  const monthlyRent = Number(booking.roomId.rent || 0);
  const securityDeposit = Number(booking.roomId.securityDeposit || 0);
  const bookingAmount = monthlyRent + securityDeposit;
  const platformFee = Math.round(bookingAmount * Number(process.env.PLATFORM_FEE_PERCENT || 2) / 100);
  return { monthlyRent, securityDeposit, bookingAmount, platformFee, totalAmount: bookingAmount + platformFee };
};

const getBookingEndDate = (moveInDate, duration) => {
  const endDate = new Date(moveInDate);
  endDate.setMonth(endDate.getMonth() + Number(duration));
  return endDate;
};

const hasOverlappingBooking = async (booking) => {
  const requestedEnd = getBookingEndDate(booking.moveInDate, booking.duration);
  const activeBookings = await Booking.find({
    _id: { $ne: booking._id },
    roomId: booking.roomId,
    status: { $in: ['Payment Required', 'Confirmed'] },
    moveInDate: { $lt: requestedEnd }
  }).select('moveInDate duration');
  return activeBookings.some((existing) => getBookingEndDate(existing.moveInDate, existing.duration) > new Date(booking.moveInDate));
};

export const createBooking = async (req, res) => {
  try {
    const { roomId, moveInDate, duration, occupants, message } = req.body;
    
    if (!roomId || !moveInDate || !duration || !occupants) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (await hasOverlappingBooking({ roomId, moveInDate, duration })) {
      return res.status(409).json({ message: 'Room is already booked for part of this period' });
    }
    
    const booking = new Booking({
      roomId,
      userId: req.userId,
      ownerId: room.ownerId,
      moveInDate,
      duration,
      occupants,
      message
    });
    
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('roomId')
      .populate('ownerId', 'name phone profileImage');
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.userId })
      .populate('roomId')
      .populate('userId', 'name email phone');
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Owners can only accept or reject pending requests' });
    }
    if (booking.status !== 'Pending') {
      return res.status(409).json({ message: 'This booking request is no longer pending' });
    }
    if (status === 'Accepted' && await hasOverlappingBooking(booking)) {
      return res.status(409).json({ message: 'Another booking already covers this period' });
    }

    booking.status = status === 'Accepted' ? 'Payment Required' : status;
    if (status === 'Accepted') {
      booking.paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await Notification.create({
        userId: booking.userId,
        title: 'Booking request accepted',
        message: 'Your booking request has been accepted by the owner. Please complete the payment to confirm your booking.',
        type: 'approval',
        relatedId: booking._id
      });
    }
    if (status === 'Rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: `Booking ${status === 'Accepted' ? 'accepted' : 'rejected'} successfully`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Payment gateway is not configured' });

    const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId, status: 'Payment Required' }).populate('roomId').populate('ownerId', 'name');
    if (!booking) return res.status(404).json({ message: 'Approved booking eligible for payment was not found' });
    if (booking.paymentDeadline && booking.paymentDeadline < new Date()) return res.status(400).json({ message: 'Payment deadline has expired' });

    const summary = getPaymentSummary(booking);
    if (summary.totalAmount < 1) return res.status(400).json({ message: 'Invalid booking amount' });
    const existingPayment = await Payment.findOne({ bookingId: booking._id });
    if (existingPayment?.status === 'Paid') return res.status(409).json({ message: 'This booking has already been paid' });

    const order = existingPayment?.razorpayOrderId
      ? { id: existingPayment.razorpayOrderId, amount: existingPayment.amount * 100, currency: existingPayment.currency }
      : await razorpay.orders.create({ amount: summary.totalAmount * 100, currency: 'INR', receipt: `booking_${booking._id}` });
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      { bookingId: booking._id, userId: req.userId, amount: summary.totalAmount, currency: 'INR', razorpayOrderId: order.id, status: 'Created' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: { bookingId: booking._id, roomName: booking.roomId.title, ownerName: booking.ownerId?.name || 'Owner', moveInDate: booking.moveInDate, paymentDeadline: booking.paymentDeadline, ...summary, razorpayOrderId: order.id, razorpayKeyId: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!orderId || !paymentId || !signature) return res.status(400).json({ message: 'Incomplete payment response' });
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) return res.status(400).json({ message: 'Payment verification failed' });

    const payment = await Payment.findOne({ razorpayOrderId: orderId, userId: req.userId });
    if (!payment) return res.status(404).json({ message: 'Payment order not found' });
    if (payment.status === 'Paid') return res.json({ success: true, data: await Booking.findById(payment.bookingId).populate('roomId').populate('ownerId', 'name'), message: 'Payment already verified' });

    const booking = await Booking.findOneAndUpdate(
      { _id: payment.bookingId, userId: req.userId, status: 'Payment Required' },
      { status: 'Confirmed', updatedAt: new Date() },
      { new: true }
    ).populate('roomId').populate('ownerId', 'name');
    if (!booking) return res.status(409).json({ message: 'Booking is no longer available for payment' });

    const room = await Room.findOneAndUpdate({ _id: booking.roomId._id, status: 'Active' }, { status: 'Rented', updatedAt: new Date() }, { new: true });
    if (!room) {
      await Booking.updateOne({ _id: booking._id, status: 'Confirmed' }, { status: 'Payment Required' });
      return res.status(409).json({ message: 'Room is no longer available for this booking period' });
    }
    payment.razorpayPaymentId = paymentId;
    payment.status = 'Paid';
    payment.paidAt = new Date();
    await payment.save();
    res.json({ success: true, data: { booking, payment: { amount: payment.amount, transactionId: paymentId, paidAt: payment.paidAt } } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayment = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId, status: 'Payment Required' }).populate('roomId').populate('ownerId', 'name');
  if (!booking) return res.status(404).json({ message: 'Payment is not available for this booking' });
  res.json({ success: true, data: { bookingId: booking._id, roomName: booking.roomId.title, ownerName: booking.ownerId?.name || 'Owner', moveInDate: booking.moveInDate, paymentDeadline: booking.paymentDeadline, ...getPaymentSummary(booking) } });
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    booking.status = 'Cancelled';
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
