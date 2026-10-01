import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: 'Rich Cake Shop',
    },
    tagline: {
      type: String,
      default: 'Artisanal Handcrafted Cakes & Bespoke Celebration Confections',
    },
    phone: {
      type: String,
      required: true,
      default: '+91 98200 98200',
    },
    email: {
      type: String,
      required: true,
      default: 'hello@richcakeshop.com',
    },
    address: {
      shopNo: { type: String, default: 'Shop 4 & 5, Crystal Heights' },
      street: { type: String, default: 'Station Road, Near Mankhurd Railway Station' },
      locality: { type: String, default: 'Mankhurd West' },
      city: { type: String, default: 'Mumbai' },
      state: { type: String, default: 'Maharashtra' },
      pincode: { type: String, default: '400088' },
    },
    businessHours: {
      openingTime: { type: String, default: '09:00' },
      closingTime: { type: String, default: '22:00' },
      daysOpen: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    },
    orderCutoffLeadHours: {
      type: Number,
      default: 4,
    },
    holidays: {
      type: [Date],
      default: [],
    },
    paymentOptions: {
      allowOnlineRazorpay: { type: Boolean, default: true },
      allowCashOnDelivery: { type: Boolean, default: true },
      allowPayOnPickup: { type: Boolean, default: true },
      codMaxOrderAmount: { type: Number, default: 300000 }, // in paise (₹3,000)
    },
    heroBanner: {
      badgeText: { type: String, default: 'Artisanal Mumbai Bakery • 100% Fresh Daily' },
      title: { type: String, default: 'Handcrafted Elegance for Life’s Sweetest Moments' },
      subtitle: {
        type: String,
        default:
          'From ready-made gourmet indulgence to bespoke multi-tiered celebration masterpieces, baked freshly with premium Belgian chocolates and farm-fresh ingredients in Mankhurd, Mumbai.',
      },
      ctaPrimaryText: { type: String, default: 'Explore Cake Catalogue' },
      ctaSecondaryText: { type: String, default: 'Custom Cake Studio' },
    },
    policies: {
      deliveryPolicy: {
        type: String,
        default:
          'We deliver across Mankhurd, Chembur, Govandi, Ghatkopar, Sion and Navi Mumbai. All cakes are delivered via temperature-controlled carriers to guarantee fresh cream integrity.',
      },
      cancellationRefundPolicy: {
        type: String,
        default:
          'Cancellations made 24+ hours prior to delivery slot are eligible for a 100% refund. Same-day cancellations for custom cakes are non-refundable as fresh baking begins at dawn.',
      },
      privacyPolicy: {
        type: String,
        default:
          'We strictly respect your privacy. Personal contact information is solely used for delivery coordination and order updates.',
      },
      termsAndConditions: {
        type: String,
        default:
          'Orders are confirmed upon successful online payment verification or COD eligibility check. All decorative items and toppers are food-safe.',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
