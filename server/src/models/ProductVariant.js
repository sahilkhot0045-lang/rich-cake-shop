import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    weightGram: {
      type: Number,
      required: true,
      min: 100,
    },
    weightLabel: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Price in paise
    },
    stockQuantity: {
      type: Number,
      default: 50,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
