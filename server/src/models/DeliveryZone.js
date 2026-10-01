import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
  {
    zoneName: {
      type: String,
      required: true,
      trim: true,
    },
    pincodes: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, 'At least one PIN code must be assigned to zone'],
    },
    deliveryFee: {
      type: Number, // In paise
      required: true,
      default: 5000, // ₹50
    },
    freeDeliveryThreshold: {
      type: Number, // In paise
      default: 100000, // ₹1,000
    },
    estimatedHours: {
      type: Number,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to test if a given pincode is covered
deliveryZoneSchema.statics.findZoneForPincode = async function (pincode) {
  return this.findOne({ pincodes: pincode, isActive: true });
};

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
