import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    changeQuantity: {
      type: Number,
      required: true, // e.g. -2 for sale, +2 for restock/cancellation
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ['sale', 'cancellation_restock', 'manual_adjustment', 'waste', 'initial_seed'],
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
  },
  {
    timestamps: true,
  }
);

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
