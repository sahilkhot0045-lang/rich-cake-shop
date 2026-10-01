import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({
      product: productId,
      isApprovedByAdmin: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getHomeTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Review.find({
      isApprovedByAdmin: true,
      isFeaturedOnHome: true,
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const { productId, customerName, rating, comment, flavourMentioned, orderId } = req.body;

    const review = await Review.create({
      product: productId || undefined,
      order: orderId || undefined,
      user: req.user ? req.user.id : undefined,
      customerName,
      rating: Number(rating),
      comment,
      flavourMentioned: flavourMentioned || '',
      isVerifiedPurchase: Boolean(orderId),
      isApprovedByAdmin: false, // Strict: needs admin moderation
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your review! To preserve authenticity, our team will review and publish it shortly.',
      review,
    });
  } catch (error) {
    next(error);
  }
};
