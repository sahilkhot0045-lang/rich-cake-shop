import mongoose from 'mongoose';

const customCakeRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    occasion: {
      type: String,
      required: true,
      enum: ['Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Farewell', 'Corporate', 'Other'],
    },
    referenceImages: {
      type: [String],
      default: [],
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTimeSlot: {
      type: String,
      default: 'Morning (10:00 AM - 1:00 PM)',
    },
    flavour: {
      type: String,
      required: true,
    },
    weightGram: {
      type: Number,
      required: true,
      min: 1000,
    },
    shape: {
      type: String,
      required: true,
      enum: ['Round', 'Square', 'Heart', 'Multi-Tier', 'Custom Sculpted'],
    },
    tiers: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    colourTheme: {
      type: String,
      default: 'Pastel Pink & Cream with Gold Highlights',
    },
    eggless: {
      type: Boolean,
      default: true,
    },
    inscription: {
      type: String,
      maxlength: 100,
      default: '',
    },
    dietaryRequests: {
      type: String,
      default: '',
    },
    estimatedBudget: {
      type: Number, // In paise
      default: 0,
    },
    detailedInstructions: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'quoted', 'accepted', 'rejected', 'expired', 'converted_to_order'],
      default: 'submitted',
      index: true,
    },
    activeQuote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
    },
    rejectionReason: String,
    communicationNotes: [
      {
        sender: {
          type: String,
          enum: ['customer', 'admin'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CustomCakeRequest = mongoose.model('CustomCakeRequest', customCakeRequestSchema);
