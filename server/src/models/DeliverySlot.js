import mongoose from 'mongoose';

const deliverySlotSchema = new mongoose.Schema(
  {
    slotName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true, // e.g. "10:00"
    },
    endTime: {
      type: String,
      required: true, // e.g. "13:00"
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 8,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const DeliverySlot = mongoose.model('DeliverySlot', deliverySlotSchema);
