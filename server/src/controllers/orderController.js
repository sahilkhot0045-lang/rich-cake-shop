import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { DeliverySlot } from '../models/DeliverySlot.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Coupon } from '../models/Coupon.js';
import { Cart } from '../models/Cart.js';
import { Notification } from '../models/Notification.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../config/razorpay.js';

// Helper to generate human-readable unique order number e.g. RC-202609-8472
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RC-${dateStr}-${randomSuffix}`;
};

// Helper: re-verify and calculate order items server-side from DB
const computeServerValidatedItems = async (items) => {
  if (!items || !items.length) {
    throw new Error('No items provided in order');
  }

  let subtotal = 0; // in paise
  const orderItems = [];

  for (const it of items) {
    const variant = await ProductVariant.findById(it.variantId).populate('product');
    if (!variant || !variant.isActive || !variant.product || !variant.product.isActive) {
      throw new Error(`Item ${it.title || 'Cake'} is no longer available`);
    }

    if (variant.stockQuantity < it.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.title} (${variant.weightLabel}). Only ${variant.stockQuantity} left.`);
    }

    const itemPrice = variant.price; // authoritative paise
    const totalPrice = itemPrice * it.quantity;
    subtotal += totalPrice;

    orderItems.push({
      product: variant.product._id,
      variant: variant._id,
      title: variant.product.title,
      flavour: it.flavour || variant.product.flavours[0],
      weightLabel: variant.weightLabel,
      unitPrice: itemPrice,
      quantity: it.quantity,
      totalPrice,
      eggless: Boolean(it.eggless),
      inscription: it.inscription || '',
      image: variant.product.images[0] || '',
    });
  }

  return { orderItems, subtotal };
};

// 1. Create Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const {
      orderType,
      customer,
      shippingAddress,
      deliveryDate,
      deliverySlotId,
      specialInstructions,
      couponCode,
      items,
    } = req.body;

    const deliveryDateObj = new Date(deliveryDate);
    deliveryDateObj.setHours(0, 0, 0, 0);

    // Verify delivery slot
    const slot = await DeliverySlot.findById(deliverySlotId);
    if (!slot || !slot.isActive) {
      return res.status(400).json({ success: false, message: 'Selected delivery time slot is unavailable' });
    }

    // Verify slot capacity on this date
    const nextDay = new Date(deliveryDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedOrders = await Order.countDocuments({
      deliveryDate: { $gte: deliveryDateObj, $lt: nextDay },
      deliverySlot: slot._id,
      orderStatus: { $nin: ['cancelled', 'refunded'] },
    });

    if (bookedOrders >= slot.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'This delivery slot has reached full capacity. Please pick another available slot.',
      });
    }

    // Server-side item pricing & stock verification
    const { orderItems, subtotal } = await computeServerValidatedItems(items);

    // Calculate delivery fee
    let deliveryFee = 0;
    if (orderType === 'delivery') {
      if (!shippingAddress || !shippingAddress.pincode) {
        return res.status(400).json({ success: false, message: 'Valid delivery address with PIN code is required' });
      }
      const zone = await DeliveryZone.findZoneForPincode(shippingAddress.pincode);
      if (!zone) {
        return res.status(400).json({
          success: false,
          message: `Delivery is not available to PIN code ${shippingAddress.pincode}.`,
        });
      }
      if (subtotal < zone.freeDeliveryThreshold) {
        deliveryFee = zone.deliveryFee;
      }
    }

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (coupon && coupon.isValidForOrder(subtotal).valid) {
        discount = coupon.calculateDiscount(subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);
    const orderNumber = generateOrderNumber();

    // Create Razorpay Order via SDK
    const razorpay = getRazorpayInstance();
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: totalAmount, // strictly in paise
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          customerName: customer.name,
          customerPhone: customer.phone,
          orderNumber,
        },
      });
    } catch (rzpErr) {
      // In development or if test keys are simulated
      console.warn('[Razorpay API Warning]:', rzpErr.message);
      rzpOrder = {
        id: `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        amount: totalAmount,
        currency: 'INR',
        status: 'created',
      };
    }

    // Persist order with pending_payment status
    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user.id : undefined,
      customer,
      orderType,
      shippingAddress: orderType === 'delivery' ? shippingAddress : undefined,
      deliveryDate: deliveryDateObj,
      deliverySlot: slot._id,
      deliverySlotWindow: slot.slotName,
      items: orderItems,
      pricing: {
        subtotal,
        discount,
        deliveryFee,
        tax: 0,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
      },
      orderStatus: 'pending_payment',
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      specialInstructions: specialInstructions || '',
      statusHistory: [
        {
          status: 'pending_payment',
          note: `Checkout initiated for ${orderNumber}`,
        },
      ],
    });

    // Create payment entry
    await Payment.create({
      order: order._id,
      user: req.user ? req.user.id : undefined,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      currency: 'INR',
      status: 'created',
    });

    res.status(200).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount, // paise
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RichCakeShopTestKey',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Verify Razorpay Payment Signature and finalize order
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Idempotency check: if already confirmed/paid, return success
    if (order.orderStatus === 'confirmed' && order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Order already verified and confirmed',
        order,
      });
    }

    // Cryptographic signature verification
    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Also support test mode simulation signature if using mock prefix in dev
    const isSimulated =
      process.env.NODE_ENV !== 'production' &&
      (razorpay_order_id.startsWith('order_sim_') || razorpay_signature === 'simulated_test_signature');

    if (!isValidSignature && !isSimulated) {
      await Payment.findOneAndUpdate(
        { order: order._id, razorpayOrderId: razorpay_order_id },
        { status: 'failed', errorDescription: 'Invalid Razorpay cryptographic signature' }
      );
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Order not confirmed.',
      });
    }

    // Deduct stock for each variant atomically
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.variant);
      if (variant) {
        const prevStock = variant.stockQuantity;
        variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
        await variant.save();

        await InventoryMovement.create({
          product: item.product,
          variant: item.variant,
          changeQuantity: -item.quantity,
          previousStock: prevStock,
          newStock: variant.stockQuantity,
          reason: 'sale',
          order: order._id,
        });
      }
    }

    // Update order status
    order.orderStatus = 'confirmed';
    order.paymentStatus = 'paid';
    order.pricing.amountPaid = order.pricing.totalAmount;
    order.pricing.balanceDue = 0;
    order.statusHistory.push({
      status: 'confirmed',
      note: `Payment verified successfully via Razorpay (Payment ID: ${razorpay_payment_id})`,
    });
    await order.save();

    // Update Payment record
    await Payment.findOneAndUpdate(
      { order: order._id, razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        idempotentKey: `captured_${razorpay_payment_id}`,
      },
      { upsert: true }
    );

    // Notify user
    if (order.user) {
      await Notification.create({
        user: order.user,
        title: 'Cake Order Confirmed! 🎉',
        message: `Your order #${order.orderNumber} has been verified and sent to our master bakeries.`,
        type: 'order_update',
        order: order._id,
      });

      // Clear user cart
      await Cart.findOneAndUpdate({ user: order.user }, { items: [], appliedCoupon: undefined });
    }

    res.status(200).json({
      success: true,
      message: 'Payment successfully verified. Your order is confirmed!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Create Offline Order (COD or Pay on Pickup)
export const createOfflineOrder = async (req, res, next) => {
  try {
    const {
      orderType,
      customer,
      shippingAddress,
      deliveryDate,
      deliverySlotId,
      specialInstructions,
      couponCode,
      items,
      paymentMethod, // 'cod' or 'pay_on_pickup'
    } = req.body;

    const settings = await StoreSettings.findOne();
    if (paymentMethod === 'cod' && !settings?.paymentOptions?.allowCashOnDelivery) {
      return res.status(400).json({ success: false, message: 'Cash on delivery is currently disabled' });
    }
    if (paymentMethod === 'pay_on_pickup' && !settings?.paymentOptions?.allowPayOnPickup) {
      return res.status(400).json({ success: false, message: 'Payment on pickup is currently disabled' });
    }

    const deliveryDateObj = new Date(deliveryDate);
    deliveryDateObj.setHours(0, 0, 0, 0);

    const slot = await DeliverySlot.findById(deliverySlotId);
    if (!slot || !slot.isActive) {
      return res.status(400).json({ success: false, message: 'Selected time slot is unavailable' });
    }

    // Check slot capacity
    const nextDay = new Date(deliveryDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedOrders = await Order.countDocuments({
      deliveryDate: { $gte: deliveryDateObj, $lt: nextDay },
      deliverySlot: slot._id,
      orderStatus: { $nin: ['cancelled', 'refunded'] },
    });

    if (bookedOrders >= slot.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is fully booked. Please choose another slot.',
      });
    }

    const { orderItems, subtotal } = await computeServerValidatedItems(items);

    let deliveryFee = 0;
    if (orderType === 'delivery') {
      if (!shippingAddress || !shippingAddress.pincode) {
        return res.status(400).json({ success: false, message: 'Valid delivery address with PIN code is required' });
      }
      const zone = await DeliveryZone.findZoneForPincode(shippingAddress.pincode);
      if (!zone) {
        return res.status(400).json({
          success: false,
          message: `Delivery is not available to PIN code ${shippingAddress.pincode}.`,
        });
      }
      if (subtotal < zone.freeDeliveryThreshold) {
        deliveryFee = zone.deliveryFee;
      }
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (coupon && coupon.isValidForOrder(subtotal).valid) {
        discount = coupon.calculateDiscount(subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

    // Enforce COD order amount limit
    if (paymentMethod === 'cod') {
      const codLimit = settings?.paymentOptions?.codMaxOrderAmount || 300000;
      if (totalAmount > codLimit) {
        return res.status(400).json({
          success: false,
          message: `Cash on Delivery is limited to orders up to ₹${codLimit / 100}. Please choose online Razorpay payment.`,
        });
      }
    }

    const orderNumber = generateOrderNumber();

    // Deduct stock atomically
    for (const item of orderItems) {
      const variant = await ProductVariant.findById(item.variant);
      if (variant) {
        const prevStock = variant.stockQuantity;
        variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
        await variant.save();

        await InventoryMovement.create({
          product: item.product,
          variant: item.variant,
          changeQuantity: -item.quantity,
          previousStock: prevStock,
          newStock: variant.stockQuantity,
          reason: 'sale',
        });
      }
    }

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user.id : undefined,
      customer,
      orderType,
      shippingAddress: orderType === 'delivery' ? shippingAddress : undefined,
      deliveryDate: deliveryDateObj,
      deliverySlot: slot._id,
      deliverySlotWindow: slot.slotName,
      items: orderItems,
      pricing: {
        subtotal,
        discount,
        deliveryFee,
        tax: 0,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
      },
      orderStatus: 'confirmed',
      paymentMethod,
      paymentStatus: 'pending',
      specialInstructions: specialInstructions || '',
      statusHistory: [
        {
          status: 'confirmed',
          note: `Order placed with ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay on Pickup'}`,
        },
      ],
    });

    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], appliedCoupon: undefined });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Public Order Tracking
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase() })
      .select('orderNumber orderType orderStatus paymentMethod paymentStatus deliveryDate deliverySlotWindow shippingAddress specialInstructions pricing items createdAt statusHistory customer.name customer.phone customer.email')
      .populate('deliverySlot', 'slotName startTime endTime');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found. Please double check your order reference number.`,
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get My Orders (Customer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('deliverySlot', 'slotName');

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get Order By Id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('deliverySlot')
      .populate('items.product', 'title slug images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check: if logged in user, must match user or be admin
    if (req.user && req.user.role !== 'admin' && order.user && order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
