import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Coupon } from '../models/Coupon.js';

// Helper to get or create cart for user or guest
const getOrCreateCart = async (req) => {
  const userId = req.user ? req.user.id : null;
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || 'guest-session-rich-cake';

  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
  } else {
    cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }
  }

  return cart;
};

// Calculate cart totals
const formatCartResponse = async (cart) => {
  await cart.populate([
    { path: 'items.product', select: 'title slug images isEgglessAvailable flavours' },
    { path: 'items.variant', select: 'weightLabel weightGram price stockQuantity' },
    { path: 'appliedCoupon' },
  ]);

  let subtotal = 0; // in paise
  const validItems = [];

  for (const item of cart.items) {
    if (item.product && item.variant) {
      // Use current variant price as source of truth
      const itemTotal = item.variant.price * item.quantity;
      subtotal += itemTotal;
      validItems.push({
        _id: item._id,
        productId: item.product._id,
        variantId: item.variant._id,
        title: item.product.title,
        slug: item.product.slug,
        image: item.product.images[0] || '',
        weightLabel: item.variant.weightLabel,
        flavour: item.flavour,
        eggless: item.eggless,
        unitPrice: item.variant.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
        inscription: item.inscription,
        specialInstructions: item.specialInstructions,
        inStock: item.variant.stockQuantity >= item.quantity,
      });
    }
  }

  let discount = 0;
  let couponInfo = null;

  if (cart.appliedCoupon) {
    const couponValidation = cart.appliedCoupon.isValidForOrder(subtotal);
    if (couponValidation.valid) {
      discount = cart.appliedCoupon.calculateDiscount(subtotal);
      couponInfo = {
        code: cart.appliedCoupon.code,
        discountType: cart.appliedCoupon.discountType,
        discountValue: cart.appliedCoupon.discountValue,
        discountAmount: discount,
      };
    } else {
      // Invalidate coupon if order criteria no longer met
      cart.appliedCoupon = undefined;
      await cart.save();
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  return {
    cartId: cart._id,
    items: validItems,
    itemCount: validItems.reduce((acc, curr) => acc + curr.quantity, 0),
    pricing: {
      subtotal, // in paise
      subtotalInRupees: subtotal / 100,
      discount, // in paise
      discountInRupees: discount / 100,
      finalTotal, // in paise
      finalTotalInRupees: finalTotal / 100,
    },
    coupon: couponInfo,
  };
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req);
    const formatted = await formatCartResponse(cart);
    res.status(200).json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity, eggless, flavour, inscription, specialInstructions } = req.body;

    const [product, variant] = await Promise.all([
      Product.findOne({ _id: productId, isActive: true }),
      ProductVariant.findOne({ _id: variantId, product: productId, isActive: true }),
    ]);

    if (!product || !variant) {
      return res.status(404).json({ success: false, message: 'Selected cake or variant not available' });
    }

    if (variant.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stockQuantity} units available in stock.`,
      });
    }

    const cart = await getOrCreateCart(req);

    // Check if same item with same variant, flavour, eggless, inscription exists
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.toString() === variantId &&
        item.flavour === flavour &&
        item.eggless === Boolean(eggless) &&
        item.inscription === (inscription || '')
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (variant.stockQuantity < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Available stock limit is ${variant.stockQuantity}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].priceSnapshot = variant.price;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        priceSnapshot: variant.price,
        eggless: Boolean(eggless),
        flavour,
        inscription: inscription || '',
        specialInstructions: specialInstructions || '',
      });
    }

    await cart.save();
    const formatted = await formatCartResponse(cart);
    res.status(200).json({ success: true, message: 'Added to cake cart', cart: formatted });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, specialInstructions } = req.body;

    const cart = await getOrCreateCart(req);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity !== undefined) {
      const variant = await ProductVariant.findById(item.variant);
      if (variant && variant.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stockQuantity} units available.`,
        });
      }
      item.quantity = quantity;
    }

    if (specialInstructions !== undefined) {
      item.specialInstructions = specialInstructions;
    }

    await cart.save();
    const formatted = await formatCartResponse(cart);
    res.status(200).json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req);

    cart.items.pull({ _id: itemId });
    await cart.save();

    const formatted = await formatCartResponse(cart);
    res.status(200).json({ success: true, message: 'Item removed', cart: formatted });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code required' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }

    const cart = await getOrCreateCart(req);
    const formattedPre = await formatCartResponse(cart);

    const validation = coupon.isValidForOrder(formattedPre.pricing.subtotal);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    cart.appliedCoupon = coupon._id;
    await cart.save();

    const formatted = await formatCartResponse(cart);
    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      cart: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req);
    cart.appliedCoupon = undefined;
    await cart.save();

    const formatted = await formatCartResponse(cart);
    res.status(200).json({ success: true, message: 'Coupon removed', cart: formatted });
  } catch (error) {
    next(error);
  }
};
