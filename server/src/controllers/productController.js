import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Review } from '../models/Review.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      flavour,
      eggless,
      glutenFree,
      sugarFree,
      vegan,
      nutFree,
      minPrice,
      maxPrice,
      readyMade,
      featured,
      bestSeller,
      seasonal,
      sort = 'popular',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { flavours: { $regex: search, $options: 'i' } },
      ];
    }

    // Category
    if (category) {
      query.category = category;
    }

    // Flavour
    if (flavour) {
      query.flavours = flavour;
    }

    // Eggless
    if (eggless === 'true') {
      query.isEgglessAvailable = true;
    }

    // Dietary
    if (glutenFree === 'true') query['dietaryInfo.isGlutenFree'] = true;
    if (sugarFree === 'true') query['dietaryInfo.isSugarFree'] = true;
    if (vegan === 'true') query['dietaryInfo.isVegan'] = true;
    if (nutFree === 'true') query['dietaryInfo.isNutFree'] = true;

    // Badges / Flags
    if (readyMade === 'true') query.isReadyMade = true;
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (seasonal === 'true') query.isSeasonal = true;

    // Price range (frontend sends in Rupees, converted to paise)
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice) * 100;
      if (maxPrice) query.basePrice.$lte = Number(maxPrice) * 100;
    }

    // Sort order
    let sortQuery = {};
    if (sort === 'price_asc') sortQuery = { basePrice: 1 };
    else if (sort === 'price_desc') sortQuery = { basePrice: -1 };
    else if (sort === 'rating') sortQuery = { ratingsAverage: -1, ratingsQuantity: -1 };
    else if (sort === 'newest') sortQuery = { createdAt: -1 };
    else sortQuery = { isBestSeller: -1, isFeatured: -1, ratingsAverage: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate({
          path: 'variants',
          match: { isActive: true },
        })
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate({
        path: 'variants',
        match: { isActive: true },
      });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch approved customer reviews
    const reviews = await Review.find({
      product: product._id,
      isApprovedByAdmin: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      product,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const checkPincodeEligibility = async (req, res, next) => {
  try {
    const { pincode } = req.query;

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit Indian PIN code',
      });
    }

    const zone = await DeliveryZone.findZoneForPincode(pincode);

    if (!zone) {
      return res.status(200).json({
        success: true,
        isDeliverable: false,
        message: `We currently do not deliver to PIN code ${pincode}. Pick-up from our Mankhurd bakery is available!`,
      });
    }

    res.status(200).json({
      success: true,
      isDeliverable: true,
      zoneName: zone.zoneName,
      deliveryFee: zone.deliveryFee, // in paise
      deliveryFeeInRupees: zone.deliveryFee / 100,
      freeDeliveryThreshold: zone.freeDeliveryThreshold,
      estimatedHours: zone.estimatedHours,
      message: `Delivery available in ${zone.zoneName}! Estimated delivery time: ${zone.estimatedHours} hours.`,
    });
  } catch (error) {
    next(error);
  }
};
