import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Single Room', 'Shared Room', 'PG', 'Hostel', 'Apartment', 'Flat', 'Studio', 'House'],
    required: true
  },
  roomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Shared'],
    required: true
  },
  rent: {
    type: Number,
    required: [true, 'Monthly rent is required']
  },
  securityDeposit: Number,
  maintenanceCharges: Number,
  electricityCharges: Number,
  waterCharges: Number,
  otherCharges: Number,
  area: Number,
  floor: String,
  bedrooms: Number,
  bathrooms: Number,
  furnishing: {
    type: String,
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
  },
  amenities: [String],
  images: [
    {
      url: String,
      publicId: String,
      isMain: Boolean
    }
  ],
  video: {
    url: String,
    publicId: String
  },
  address: String,
  city: {
    type: String,
    required: true
  },
  state: String,
  pincode: String,
  nearbyLandmark: String,
  latitude: Number,
  longitude: Number,
  availableFrom: Date,
  minimumStay: Number,
  maximumStay: Number,
  rules: {
    smokingAllowed: Boolean,
    petsAllowed: Boolean,
    visitorsAllowed: Boolean,
    cookingAllowed: Boolean,
    alcoholAllowed: Boolean,
    studentFriendly: Boolean,
    professionalFriendly: Boolean,
    genderPreference: {
      type: String,
      enum: ['Any', 'Male', 'Female']
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Pending Approval', 'Rented', 'Unavailable', 'Rejected'],
    default: 'Pending Approval'
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Room', roomSchema);
