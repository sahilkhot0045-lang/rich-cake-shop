import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    streetAddress: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Mumbai',
    },
    state: {
      type: String,
      required: true,
      trim: true,
      default: 'Maharashtra',
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code'],
      index: true,
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Address = mongoose.model('Address', addressSchema);
