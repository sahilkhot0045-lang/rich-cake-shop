import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price in paise is required'],
      min: [0, 'Base price cannot be negative'],
      index: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: [(val) => val.length > 0, 'Please provide at least one product photo'],
    },
    flavours: {
      type: [String],
      default: ['Classic Vanilla', 'Belgian Chocolate'],
    },
    isEgglessAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    dietaryInfo: {
      isGlutenFree: { type: Boolean, default: false },
      isSugarFree: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isNutFree: { type: Boolean, default: false },
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    servingGuide: {
      type: String,
      default: '0.5 kg serves 4-6 portions, 1 kg serves 8-12 portions',
    },
    preparationTimeHours: {
      type: Number,
      default: 4,
      min: 1,
    },
    minimumLeadDays: {
      type: Number,
      default: 0,
    },
    isReadyMade: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSeasonal: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product',
});

// Text index for search
productSchema.index({ title: 'text', description: 'text', flavours: 'text' });

export const Product = mongoose.model('Product', productSchema);
