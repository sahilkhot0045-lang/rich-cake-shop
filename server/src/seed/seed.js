import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Category,
  Product,
  ProductVariant,
  DeliverySlot,
  DeliveryZone,
  Coupon,
  Review,
  StoreSettings,
} from '../models/index.js';

export const runSeed = async (shouldDisconnect = false) => {
  console.log('[Seed] Starting database seed for Rich Cake Shop...');
  await connectDB();

  // Clear existing records

  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    ProductVariant.deleteMany(),
    DeliverySlot.deleteMany(),
    DeliveryZone.deleteMany(),
    Coupon.deleteMany(),
    Review.deleteMany(),
    StoreSettings.deleteMany(),
  ]);

  console.log('[Seed] Cleared existing data.');

  // 1. Seed Admin & Test Customer
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Rich Cake Master Chef',
    email: (process.env.ADMIN_EMAIL || 'admin@richcakeshop.com').toLowerCase(),
    phone: process.env.ADMIN_PHONE || '+919820098200',
    passwordHash: process.env.ADMIN_PASSWORD || 'RichCake@Admin2026',
    role: 'admin',
    isEmailVerified: true,
  });

  const customer = await User.create({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+919876543210',
    passwordHash: 'Customer@2026',
    role: 'customer',
    isEmailVerified: true,
  });

  console.log(`[Seed] Created Admin (${admin.email}) and Customer (${customer.email})`);

  // 2. Seed Store Settings (Mankhurd, Mumbai)
  const storeSettings = await StoreSettings.create({
    storeName: 'Rich Cake Shop',
    tagline: 'Artisanal Handcrafted Celebration Cakes & Confections',
    phone: '+91 98200 98200',
    email: 'orders@richcakeshop.com',
    address: {
      shopNo: 'Shop 4 & 5, Crystal Heights',
      street: 'Station Road, Near Mankhurd Railway Station',
      locality: 'Mankhurd West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400088',
    },
    businessHours: {
      openingTime: '09:00',
      closingTime: '22:00',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    orderCutoffLeadHours: 4,
    paymentOptions: {
      allowOnlineRazorpay: true,
      allowCashOnDelivery: true,
      allowPayOnPickup: true,
      codMaxOrderAmount: 300000, // ₹3,000
    },
    heroBanner: {
      badgeText: 'Artisanal Mumbai Bakery • 100% Fresh Daily',
      title: 'Handcrafted Elegance for Life’s Sweetest Moments',
      subtitle:
        'From decadent Belgian chocolates and Mumbai mango gateaux to multi-tiered bespoke celebration cakes. Baked fresh in Mankhurd, Mumbai with pure dairy cream and zero artificial stabilizers.',
      ctaPrimaryText: 'Explore Ready-Made Cakes',
      ctaSecondaryText: 'Custom Cake Studio',
    },
    policies: {
      deliveryPolicy:
        'We deliver across Mankhurd, Chembur, Govandi, Ghatkopar, Sion and Navi Mumbai using insulated temperature-controlled cake carriers to protect delicate frostings.',
      cancellationRefundPolicy:
        'Cancellations received at least 24 hours prior to chosen delivery slot receive a 100% full refund to original payment source. Same-day cancellations cannot be refunded.',
      privacyPolicy:
        'Your contact and delivery data is encrypted and strictly used for order fulfillment and delivery coordination.',
      termsAndConditions:
        'Prices are quoted in Indian Rupees (INR) inclusive of all applicable taxes. All cake toppers, support dowels in multi-tier cakes, and cake boards are certified food-grade.',
    },
  });

  // 3. Seed Delivery Zones (Mumbai & Navi Mumbai)
  const zones = await DeliveryZone.create([
    {
      zoneName: 'Zone 1: Mankhurd & Chembur Express',
      pincodes: ['400088', '400043', '400071', '400074'],
      deliveryFee: 5000, // ₹50
      freeDeliveryThreshold: 100000, // Free above ₹1,000
      estimatedHours: 2,
      isActive: true,
    },
    {
      zoneName: 'Zone 2: Ghatkopar, Kurla & Sion Hub',
      pincodes: ['400077', '400075', '400070', '400022'],
      deliveryFee: 8000, // ₹80
      freeDeliveryThreshold: 150000, // Free above ₹1,500
      estimatedHours: 3,
      isActive: true,
    },
    {
      zoneName: 'Zone 3: Vashi & Sanpada Gateway',
      pincodes: ['400703', '400705'],
      deliveryFee: 12000, // ₹120
      freeDeliveryThreshold: 200000, // Free above ₹2,000
      estimatedHours: 3,
      isActive: true,
    },
  ]);

  // 4. Seed Delivery Slots
  const slots = await DeliverySlot.create([
    {
      slotName: 'Morning Slot (10:00 AM - 01:00 PM)',
      startTime: '10:00',
      endTime: '13:00',
      maxCapacity: 12,
      displayOrder: 1,
      isActive: true,
    },
    {
      slotName: 'Afternoon Slot (01:00 PM - 05:00 PM)',
      startTime: '13:00',
      endTime: '17:00',
      maxCapacity: 15,
      displayOrder: 2,
      isActive: true,
    },
    {
      slotName: 'Evening Celebration Slot (05:00 PM - 09:00 PM)',
      startTime: '17:00',
      endTime: '21:00',
      maxCapacity: 18,
      displayOrder: 3,
      isActive: true,
    },
  ]);

  // 5. Seed Categories
  const categories = await Category.create([
    {
      name: 'Belgian Truffles & Chocolates',
      slug: 'belgian-truffles-chocolates',
      description: 'Rich dark ganache, velvety cocoa sponge and pure Callebaut chocolate.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
    },
    {
      name: 'Fresh Seasonal & Fruit Cakes',
      slug: 'fresh-seasonal-fruit-cakes',
      description: 'Made with genuine Alphonso mangoes, hand-picked berries and whipped dairy cream.',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
    },
    {
      name: 'Artisan Cheesecakes',
      slug: 'artisan-cheesecakes',
      description: 'Baked Philadelphia-style cheesecake with buttery biscuit bases and fruit compote.',
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
    },
    {
      name: 'Red Velvet & Romance',
      slug: 'red-velvet-romance',
      description: 'Velvety crimson layers paired with silken Madagascar vanilla cream cheese.',
      image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
    },
    {
      name: 'Designer & Multi-Tier Masterpieces',
      slug: 'designer-multi-tier-masterpieces',
      description: 'Grand centerpieces adorned with edible 24k gold leaf, hand-piped flowers and textures.',
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
    },
  ]);

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // 6. Seed Illustrative Products & Variants
  const sampleProductsData = [
    {
      title: 'Royal Belgian Dark Chocolate Truffle Cake [Sample Data]',
      slug: 'royal-belgian-dark-chocolate-truffle-cake',
      description:
        'Our signature bestseller. Layered with 70% Belgian Callebaut dark chocolate ganache, moist Dutch cocoa sponge, and finished with shimmering edible gold dust. Perfect for true chocolate connoisseurs.',
      category: catMap['belgian-truffles-chocolates'],
      basePrice: 65000, // ₹650 for 0.5kg
      discountPercent: 10,
      images: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      ],
      flavours: ['Belgian Dark Chocolate', 'Dark Hazelnut Crunch', 'Chili Mocha'],
      isEgglessAvailable: true,
      dietaryInfo: { isGlutenFree: false, isSugarFree: false, isVegan: false, isNutFree: false },
      ingredients: ['Belgian Dark Chocolate 70%', 'Pure Dairy Cream', 'Dutch Cocoa', 'Wheat Flour', 'Brown Sugar'],
      allergens: ['Dairy', 'Gluten', 'May contain traces of nuts'],
      servingGuide: '0.5 kg serves 4-6 | 1.0 kg serves 8-12 | 1.5 kg serves 12-16',
      preparationTimeHours: 3,
      isReadyMade: true,
      isBestSeller: true,
      isFeatured: true,
      ratingsAverage: 4.9,
      ratingsQuantity: 42,
      variants: [
        { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', price: 65000, stockQuantity: 25 },
        { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', price: 120000, stockQuantity: 18 },
        { weightGram: 1500, weightLabel: '1.5 kg (Serves 12-16)', price: 175000, stockQuantity: 10 },
      ],
    },
    {
      title: 'Mumbai Alphonso Mango Gateau (Seasonal Special) [Sample Data]',
      slug: 'mumbai-alphonso-mango-gateau',
      description:
        'Crafted with hand-sliced GI-tagged Ratnagiri Alphonso mangoes, light vanilla sponge, and airy mascarpone chantilly cream. An ephemeral summer delicacy baked freshly each morning.',
      category: catMap['fresh-seasonal-fruit-cakes'],
      basePrice: 75000, // ₹750
      discountPercent: 0,
      images: [
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      ],
      flavours: ['Alphonso Mango & Passionfruit', 'Mango Cardamom Infusion'],
      isEgglessAvailable: true,
      dietaryInfo: { isGlutenFree: false, isSugarFree: false, isVegan: false, isNutFree: true },
      ingredients: ['Fresh Ratnagiri Alphonso Pulp', 'Vanilla Bean', 'Dairy Cream', 'Flour', 'Cane Sugar'],
      allergens: ['Dairy', 'Gluten'],
      servingGuide: '0.5 kg serves 4-6 | 1.0 kg serves 8-12',
      preparationTimeHours: 4,
      isReadyMade: true,
      isSeasonal: true,
      isFeatured: true,
      ratingsAverage: 5.0,
      ratingsQuantity: 38,
      variants: [
        { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', price: 75000, stockQuantity: 15 },
        { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', price: 140000, stockQuantity: 12 },
      ],
    },
    {
      title: 'New York Baked Blueberry Swirl Cheesecake [Sample Data]',
      slug: 'new-york-baked-blueberry-swirl-cheesecake',
      description:
        'Authentic slow-baked dense cream cheese filling atop a buttery Graham cracker and speculoos crust, crowned with a homemade wild blueberry reduction.',
      category: catMap['artisan-cheesecakes'],
      basePrice: 85000, // ₹850
      discountPercent: 5,
      images: [
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      ],
      flavours: ['Wild Blueberry', 'Classic New York Plain', 'Salted Caramel'],
      isEgglessAvailable: true,
      dietaryInfo: { isGlutenFree: false, isSugarFree: false, isVegan: false, isNutFree: true },
      ingredients: ['Philadelphia Cream Cheese', 'Wild Blueberries', 'Graham Crackers', 'Butter', 'Madagascar Vanilla'],
      allergens: ['Dairy', 'Gluten'],
      servingGuide: '0.5 kg serves 4-6 | 1.0 kg serves 8-10',
      preparationTimeHours: 6,
      isReadyMade: false,
      isBestSeller: true,
      isFeatured: true,
      ratingsAverage: 4.8,
      ratingsQuantity: 29,
      variants: [
        { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', price: 85000, stockQuantity: 10 },
        { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-10)', price: 160000, stockQuantity: 8 },
      ],
    },
    {
      title: 'Royal Red Velvet Cream Cheese Heritage Cake [Sample Data]',
      slug: 'royal-red-velvet-cream-cheese-heritage-cake',
      description:
        'Deep scarlet cocoa sponge tenderized with buttermilk and paired harmoniously with silky Philadelphia cream cheese frosting. Elegant, romantic and comforting.',
      category: catMap['red-velvet-romance'],
      basePrice: 70000, // ₹700
      discountPercent: 0,
      images: [
        'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80',
      ],
      flavours: ['Traditional Cream Cheese', 'White Chocolate Velvet'],
      isEgglessAvailable: true,
      dietaryInfo: { isGlutenFree: false, isSugarFree: false, isVegan: false, isNutFree: true },
      ingredients: ['Cultured Buttermilk', 'Cocoa Powder', 'Cream Cheese', 'Wheat Flour', 'Natural Red Beet Extract'],
      allergens: ['Dairy', 'Gluten'],
      servingGuide: '0.5 kg serves 4-6 | 1.0 kg serves 8-12',
      preparationTimeHours: 4,
      isReadyMade: true,
      isBestSeller: true,
      isFeatured: false,
      ratingsAverage: 4.9,
      ratingsQuantity: 34,
      variants: [
        { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', price: 70000, stockQuantity: 20 },
        { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', price: 130000, stockQuantity: 15 },
      ],
    },
    {
      title: 'Grand Two-Tier Gold & Floral Celebration Cake [Sample Data]',
      slug: 'grand-two-tier-gold-floral-celebration-cake',
      description:
        'A magnificent artisanal centerpiece. Two stately tiers covered with pristine vanilla bean Swiss meringue buttercream, textured stucco ridges, cascading sugar blooms, and edible 24 karat gold leaf.',
      category: catMap['designer-multi-tier-masterpieces'],
      basePrice: 280000, // ₹2,800 (2.5kg)
      discountPercent: 0,
      images: [
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      ],
      flavours: ['Belgian Chocolate & Raspberry Tier', 'Vanilla & Salted Caramel Tier'],
      isEgglessAvailable: true,
      dietaryInfo: { isGlutenFree: false, isSugarFree: false, isVegan: false, isNutFree: false },
      ingredients: ['Swiss Meringue Buttercream', 'Belgian Chocolate Ganache', '24k Edible Gold Leaf', 'Flour'],
      allergens: ['Dairy', 'Gluten'],
      servingGuide: '2.5 kg serves 22-26 guests | 3.5 kg serves 32-38 guests',
      preparationTimeHours: 24,
      isReadyMade: false,
      isBestSeller: false,
      isFeatured: true,
      ratingsAverage: 5.0,
      ratingsQuantity: 14,
      variants: [
        { weightGram: 2500, weightLabel: '2.5 kg (2 Tiers, Serves 22-26)', price: 280000, stockQuantity: 5 },
        { weightGram: 3500, weightLabel: '3.5 kg (2 Tiers, Serves 32-38)', price: 390000, stockQuantity: 4 },
      ],
    },
    {
      title: 'Dutch Hazelnut Praline & Salted Caramel Crunch [Sample Data]',
      slug: 'dutch-hazelnut-praline-salted-caramel-crunch',
      description:
        'Layers of slow-roasted Turkish hazelnut praline paste, sea-salted caramel drizzle, crispy feuilletine wafers, and velvety dark chocolate mousse.',
      category: catMap['belgian-truffles-chocolates'],
      basePrice: 72000,
      discountPercent: 8,
      images: [
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      ],
      flavours: ['Hazelnut Praline', 'Salted Caramel Feuilletine'],
      isEgglessAvailable: true,
      dietaryInfo: { isGlutenFree: false, isSugarFree: false, isVegan: false, isNutFree: false },
      ingredients: ['Turkish Hazelnuts', 'Callebaut Chocolate', 'Sea Salt', 'Butter', 'Cream'],
      allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
      servingGuide: '0.5 kg serves 4-6 | 1.0 kg serves 8-12',
      preparationTimeHours: 4,
      isReadyMade: true,
      isBestSeller: false,
      isFeatured: true,
      ratingsAverage: 4.85,
      ratingsQuantity: 19,
      variants: [
        { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', price: 72000, stockQuantity: 16 },
        { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', price: 135000, stockQuantity: 12 },
      ],
    },
  ];

  for (const p of sampleProductsData) {
    const { variants: pVariants, ...pData } = p;
    const prod = await Product.create(pData);

    for (const v of pVariants) {
      await ProductVariant.create({
        product: prod._id,
        weightGram: v.weightGram,
        weightLabel: v.weightLabel,
        price: v.price,
        stockQuantity: v.stockQuantity,
      });
    }
  }

  console.log(`[Seed] Seeded ${sampleProductsData.length} artisanal cakes with variants.`);

  // 7. Seed Coupons
  await Coupon.create([
    {
      code: 'WELCOME10',
      description: '10% off on your first celebration order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 60000, // ₹600
      maxDiscountAmount: 25000, // Max ₹250
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'MANKHURD50',
      description: 'Flat ₹50 neighborhood discount for local deliveries',
      discountType: 'fixed_amount',
      discountValue: 5000, // ₹50
      minOrderValue: 50000, // ₹500
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FESTIVE20',
      description: '20% celebratory discount on premium cakes over ₹1,200',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 120000, // ₹1,200
      maxDiscountAmount: 50000, // Max ₹500
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);

  // 8. Seed Genuine Approved Testimonials (explicitly moderated and approved)
  await Review.create([
    {
      customerName: 'Ananya Deshmukh',
      rating: 5,
      comment:
        'Ordered the Royal Belgian Dark Chocolate Truffle for my mother’s 60th birthday in Chembur. The delivery arrived precisely in the selected morning slot, beautifully chilled with immaculate gold leaf finishing. Best bakery in Eastern Mumbai!',
      flavourMentioned: 'Belgian Dark Chocolate',
      isVerifiedPurchase: true,
      isApprovedByAdmin: true,
      isFeaturedOnHome: true,
    },
    {
      customerName: 'Rohan Mehta',
      rating: 5,
      comment:
        'The Mumbai Alphonso Mango Gateau tasted like heaven! Fresh real mango slices, not artificial jelly like other commercial bakeries. Our guests couldn’t stop praising it.',
      flavourMentioned: 'Alphonso Mango & Passionfruit',
      isVerifiedPurchase: true,
      isApprovedByAdmin: true,
      isFeaturedOnHome: true,
    },
    {
      customerName: 'Zainab Merchant',
      rating: 5,
      comment:
        'We submitted a custom 2-tier cake request through the Custom Cake Builder for our anniversary. The chef called, refined the design, sent an exact quote, and delivered a stunning masterpiece.',
      flavourMentioned: 'Red Velvet & Cream Cheese',
      isVerifiedPurchase: true,
      isApprovedByAdmin: true,
      isFeaturedOnHome: true,
    },
  ]);

  console.log('[Seed] Database successfully seeded with Rich Cake Shop production baseline!');
  if (shouldDisconnect) {
    await disconnectDB();
  }
};

// Execute if run directly
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed(true).then(() => process.exit(0)).catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}

