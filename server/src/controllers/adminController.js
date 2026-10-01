import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Category } from '../models/Category.js';
import { Order, VALID_STATUS_TRANSITIONS } from '../models/Order.js';
import { CustomCakeRequest } from '../models/CustomCakeRequest.js';
import { Quote } from '../models/Quote.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { DeliverySlot } from '../models/DeliverySlot.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { logAdminAction } from '../middleware/auditLogger.js';

// 1. Dashboard Metrics
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const [
      revenueResult,
      totalOrders,
      pendingQuotesCount,
      todayDeliveries,
      lowStockVariants,
      recentOrders,
    ] = await Promise.all([
      // Verified revenue from paid transactions
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.amountPaid' } } },
      ]),
      Order.countDocuments(),
      CustomCakeRequest.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      Order.countDocuments({
        deliveryDate: { $gte: today, $lt: tomorrow },
        orderStatus: { $nin: ['cancelled', 'refunded'] },
      }),
      ProductVariant.find({ stockQuantity: { $lt: 10 }, isActive: true })
        .populate('product', 'title slug images')
        .limit(10),
      Order.find().sort({ createdAt: -1 }).limit(6).select('orderNumber customer pricing orderStatus paymentMethod createdAt deliveryDate'),
    ]);

    const verifiedRevenuePaise = revenueResult[0]?.totalRevenue || 0;

    // Order counts by status
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRevenuePaise: verifiedRevenuePaise,
        totalRevenueRupees: verifiedRevenuePaise / 100,
        totalOrders,
        pendingQuotesCount,
        todayDeliveries,
        statusCounts: statusMap,
        lowStockVariants,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Product Management (CRUD)
export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('variants')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      basePrice, // in paise
      discountPercent,
      images,
      flavours,
      isEgglessAvailable,
      dietaryInfo,
      ingredients,
      allergens,
      servingGuide,
      preparationTimeHours,
      isReadyMade,
      isBestSeller,
      isSeasonal,
      isFeatured,
      variants, // array of { weightGram, weightLabel, price, stockQuantity }
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description,
      category,
      basePrice: Number(basePrice),
      discountPercent: Number(discountPercent) || 0,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'],
      flavours: flavours || ['Belgian Chocolate', 'Dutch Truffle'],
      isEgglessAvailable: isEgglessAvailable !== false,
      dietaryInfo: dietaryInfo || {},
      ingredients: ingredients || [],
      allergens: allergens || [],
      servingGuide: servingGuide || 'Serves 4-8 portions',
      preparationTimeHours: Number(preparationTimeHours) || 4,
      isReadyMade: Boolean(isReadyMade),
      isBestSeller: Boolean(isBestSeller),
      isSeasonal: Boolean(isSeasonal),
      isFeatured: Boolean(isFeatured),
    });

    // Create variants if provided, or default 0.5kg & 1kg
    const variantList = variants && variants.length ? variants : [
      { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', price: basePrice, stockQuantity: 20 },
      { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', price: Math.round(basePrice * 1.8), stockQuantity: 15 },
    ];

    for (const v of variantList) {
      await ProductVariant.create({
        product: product._id,
        weightGram: v.weightGram,
        weightLabel: v.weightLabel,
        price: v.price,
        stockQuantity: v.stockQuantity || 20,
      });
    }

    await logAdminAction({
      adminId: req.user.id,
      action: 'CREATE_PRODUCT',
      targetEntity: 'Product',
      targetId: product._id,
      details: { title: product.title },
      req,
    });

    const populatedProduct = await Product.findById(product._id).populate('variants');
    res.status(201).json({ success: true, product: populatedProduct });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variants, ...productData } = req.body;

    const product = await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update variants if passed
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v._id) {
          await ProductVariant.findByIdAndUpdate(v._id, {
            price: v.price,
            stockQuantity: v.stockQuantity,
            weightLabel: v.weightLabel,
            isActive: v.isActive !== false,
          });
        } else {
          await ProductVariant.create({
            product: product._id,
            weightGram: v.weightGram || 1000,
            weightLabel: v.weightLabel || '1.0 kg',
            price: v.price || product.basePrice,
            stockQuantity: v.stockQuantity || 20,
          });
        }
      }
    }

    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_PRODUCT',
      targetEntity: 'Product',
      targetId: product._id,
      details: { title: product.title },
      req,
    });

    const populated = await Product.findById(product._id).populate('variants');
    res.status(200).json({ success: true, product: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await ProductVariant.updateMany({ product: id }, { isActive: false });

    await logAdminAction({
      adminId: req.user.id,
      action: 'DELETE_PRODUCT',
      targetEntity: 'Product',
      targetId: id,
      details: { title: product.title },
      req,
    });

    res.status(200).json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    next(error);
  }
};

// 3. Order Management
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.deliveryDate = {};
      if (startDate) query.deliveryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.deliveryDate.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('deliverySlot', 'slotName'),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nextStatus, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.canTransitionTo(nextStatus)) {
      const allowed = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${order.orderStatus}' to '${nextStatus}'. Allowed next steps: ${allowed.join(', ') || 'None'}`,
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = nextStatus;

    // If cancelled and previously confirmed/preparing, restore inventory
    if (nextStatus === 'cancelled' && ['confirmed', 'preparing'].includes(previousStatus)) {
      for (const item of order.items) {
        const variant = await ProductVariant.findById(item.variant);
        if (variant) {
          const prevStock = variant.stockQuantity;
          variant.stockQuantity += item.quantity;
          await variant.save();

          await InventoryMovement.create({
            product: item.product,
            variant: item.variant,
            changeQuantity: item.quantity,
            previousStock: prevStock,
            newStock: variant.stockQuantity,
            reason: 'cancellation_restock',
            order: order._id,
            performedBy: req.user.id,
            note: `Stock restored upon cancellation of order ${order.orderNumber}`,
          });
        }
      }
    }

    // If refunded, mark paymentStatus as refunded
    if (nextStatus === 'refunded') {
      order.paymentStatus = 'refunded';
    }

    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note: note || `Status updated to ${nextStatus} by bakery management`,
      updatedBy: req.user.id,
    });

    await order.save();

    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_ORDER_STATUS',
      targetEntity: 'Order',
      targetId: order._id,
      details: { orderNumber: order.orderNumber, from: previousStatus, to: nextStatus },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${nextStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Export Orders to CSV
export const exportOrdersCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;

    const query = {};
    if (status && status !== 'all') query.orderStatus = status;
    if (startDate || endDate) {
      query.deliveryDate = {};
      if (startDate) query.deliveryDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.deliveryDate.$lte = end;
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Build CSV
    const headers = [
      'Order Number',
      'Date Placed',
      'Delivery Date',
      'Slot',
      'Customer Name',
      'Phone',
      'Email',
      'Type',
      'Address',
      'Items Summary',
      'Subtotal (INR)',
      'Discount (INR)',
      'Delivery Fee (INR)',
      'Total Amount (INR)',
      'Order Status',
      'Payment Method',
      'Payment Status',
    ];

    const rows = orders.map((o) => {
      const itemsSummary = o.items.map((i) => `${i.title} (${i.weightLabel}) x${i.quantity}`).join('; ');
      const address = o.orderType === 'delivery' && o.shippingAddress
        ? `"${o.shippingAddress.streetAddress}, ${o.shippingAddress.city} - ${o.shippingAddress.pincode}"`
        : 'Pickup at Mankhurd Bakery';

      return [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        new Date(o.deliveryDate).toLocaleDateString('en-IN'),
        `"${o.deliverySlotWindow}"`,
        `"${o.customer.name}"`,
        o.customer.phone,
        o.customer.email,
        o.orderType,
        address,
        `"${itemsSummary}"`,
        (o.pricing.subtotal / 100).toFixed(2),
        (o.pricing.discount / 100).toFixed(2),
        (o.pricing.deliveryFee / 100).toFixed(2),
        (o.pricing.totalAmount / 100).toFixed(2),
        o.orderStatus,
        o.paymentMethod,
        o.paymentStatus,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=rich-cake-orders-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// 5. Custom Cake Quotes
export const getAdminCustomQuotes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    const requests = await CustomCakeRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('activeQuote');

    res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

export const issueCustomQuote = async (req, res, next) => {
  try {
    const { id } = req.params; // CustomCakeRequest ID
    const { quotedPrice, depositRequired, preparationTimeHours, validUntil, adminNotes } = req.body;

    const request = await CustomCakeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom cake request not found' });
    }

    const quote = await Quote.create({
      customCakeRequest: request._id,
      admin: req.user.id,
      quotedPrice: Number(quotedPrice), // paise
      depositRequired: Number(depositRequired), // paise
      preparationTimeHours: Number(preparationTimeHours) || 48,
      validUntil: new Date(validUntil),
      adminNotes: adminNotes || '',
      status: 'sent',
    });

    request.activeQuote = quote._id;
    request.status = 'quoted';
    request.communicationNotes.push({
      sender: 'admin',
      message: `Official quote issued: ₹${quotedPrice / 100} (Deposit required: ₹${depositRequired / 100}). Preparation time: ${preparationTimeHours} hours. Valid until ${new Date(validUntil).toLocaleDateString('en-IN')}.`,
      timestamp: new Date(),
    });
    await request.save();

    await logAdminAction({
      adminId: req.user.id,
      action: 'ISSUE_CUSTOM_QUOTE',
      targetEntity: 'CustomCakeRequest',
      targetId: request._id,
      details: { quotedPrice, depositRequired },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Official quote sent to customer',
      quote,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Review Moderation
export const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'title slug images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApprovedByAdmin, isFeaturedOnHome } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      {
        ...(isApprovedByAdmin !== undefined && { isApprovedByAdmin: Boolean(isApprovedByAdmin) }),
        ...(isFeaturedOnHome !== undefined && { isFeaturedOnHome: Boolean(isFeaturedOnHome) }),
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, message: 'Review moderation updated', review });
  } catch (error) {
    next(error);
  }
};

// 7. Store Settings & Delivery Zones
export const updateStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_STORE_SETTINGS',
      targetEntity: 'StoreSettings',
      targetId: settings._id,
      details: req.body,
      req,
    });

    res.status(200).json({ success: true, message: 'Store settings updated successfully', settings });
  } catch (error) {
    next(error);
  }
};

export const manageDeliveryZones = async (req, res, next) => {
  try {
    const { zones } = req.body; // Array of zones
    if (!Array.isArray(zones)) {
      return res.status(400).json({ success: false, message: 'Zones array required' });
    }

    for (const z of zones) {
      if (z._id) {
        await DeliveryZone.findByIdAndUpdate(z._id, z);
      } else {
        await DeliveryZone.create(z);
      }
    }

    const updated = await DeliveryZone.find();
    res.status(200).json({ success: true, zones: updated });
  } catch (error) {
    next(error);
  }
};

// 8. Coupons Management
export const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

// 9. Audit Logs & Inventory Logs
export const getAdminAuditLogs = async (req, res, next) => {
  try {
    const logs = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('admin', 'name email');

    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const getInventoryMovements = async (req, res, next) => {
  try {
    const logs = await InventoryMovement.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('product', 'title')
      .populate('variant', 'weightLabel')
      .populate('performedBy', 'name');

    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
