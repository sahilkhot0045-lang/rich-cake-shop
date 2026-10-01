import { CustomCakeRequest } from '../models/CustomCakeRequest.js';
import { Quote } from '../models/Quote.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { DeliverySlot } from '../models/DeliverySlot.js';
import { getRazorpayInstance } from '../config/razorpay.js';

// Estimate indicative baseline price range (explicitly marked as estimated)
export const calculateIndicativePrice = ({ weightGram, tiers, shape }) => {
  // Baseline rate: ₹900 per 1000g (in paise = 90,000 paise per kg)
  const kg = Math.max(1, weightGram / 1000);
  let basePaise = kg * 90000;

  // Multi-tier craftsmanship surcharge
  if (tiers > 1) {
    basePaise += (tiers - 1) * 35000;
  }

  // Sculpted / intricate shapes
  if (shape === 'Custom Sculpted') {
    basePaise += 50000;
  } else if (shape === 'Multi-Tier') {
    basePaise += 30000;
  }

  return {
    estimatedMinPaise: Math.round(basePaise * 0.9),
    estimatedMaxPaise: Math.round(basePaise * 1.25),
    estimatedMinRupees: Math.round((basePaise * 0.9) / 100),
    estimatedMaxRupees: Math.round((basePaise * 1.25) / 100),
  };
};

export const submitCustomCakeRequest = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      preferredDate,
      preferredTimeSlot,
      flavour,
      weightGram,
      shape,
      tiers,
      colourTheme,
      eggless,
      inscription,
      dietaryRequests,
      estimatedBudget,
      detailedInstructions,
      referenceImages,
    } = req.body;

    const indicative = calculateIndicativePrice({ weightGram, tiers, shape });

    const request = await CustomCakeRequest.create({
      user: req.user ? req.user.id : undefined,
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      preferredDate: new Date(preferredDate),
      preferredTimeSlot,
      flavour,
      weightGram,
      shape,
      tiers,
      colourTheme,
      eggless: Boolean(eggless),
      inscription: inscription || '',
      dietaryRequests: dietaryRequests || '',
      estimatedBudget: estimatedBudget || indicative.estimatedMinPaise,
      detailedInstructions,
      referenceImages: referenceImages || [],
      status: 'submitted',
      communicationNotes: [
        {
          sender: 'customer',
          message: 'Custom cake design submitted for artisanal feasibility evaluation.',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Your custom cake request has been submitted to our chefs. We will review feasibility and send an official quote within 24 hours.',
      request,
      indicativePriceRange: indicative,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCustomRequests = async (req, res, next) => {
  try {
    const requests = await CustomCakeRequest.find({
      $or: [{ user: req.user.id }, { customerEmail: req.user.email }],
    })
      .sort({ createdAt: -1 })
      .populate('activeQuote');

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const request = await CustomCakeRequest.findById(req.params.id).populate('activeQuote');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom cake request not found' });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const addCommunicationNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const request = await CustomCakeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const sender = req.user && req.user.role === 'admin' ? 'admin' : 'customer';

    request.communicationNotes.push({
      sender,
      message,
      timestamp: new Date(),
    });

    await request.save();

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const customerAcceptQuoteAndPay = async (req, res, next) => {
  try {
    const { id } = req.params; // CustomCakeRequest ID
    const { paymentOption = 'deposit' } = req.body; // 'deposit' or 'full'

    const request = await CustomCakeRequest.findById(id).populate('activeQuote');
    if (!request || !request.activeQuote) {
      return res.status(404).json({ success: false, message: 'No active quote found for this request' });
    }

    const quote = request.activeQuote;
    if (new Date() > new Date(quote.validUntil)) {
      quote.status = 'expired';
      await quote.save();
      request.status = 'expired';
      await request.save();
      return res.status(400).json({
        success: false,
        message: 'This quote has expired. Please message our cake studio to request a renewed quote.',
      });
    }

    const amountToPay = paymentOption === 'deposit' ? quote.depositRequired : quote.quotedPrice;

    // Pick first active slot as placeholder
    const defaultSlot = await DeliverySlot.findOne({ isActive: true });

    // Generate Order for Custom Cake
    const orderNumber = `RC-CUST-${Date.now().toString().slice(-6)}`;
    const razorpay = getRazorpayInstance();

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountToPay,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          customCakeRequestId: String(request._id),
          customerName: request.customerName,
          orderNumber,
        },
      });
    } catch (err) {
      rzpOrder = {
        id: `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        amount: amountToPay,
        currency: 'INR',
        status: 'created',
      };
    }

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user.id : request.user,
      customer: {
        name: request.customerName,
        email: request.customerEmail,
        phone: request.customerPhone,
      },
      orderType: 'delivery',
      deliveryDate: request.preferredDate,
      deliverySlot: defaultSlot._id,
      deliverySlotWindow: request.preferredTimeSlot || defaultSlot.slotName,
      items: [
        {
          product: defaultSlot._id, // placeholder ref
          title: `Custom Bespoke Cake: ${request.occasion} (${request.shape}, ${request.tiers} Tier)`,
          flavour: request.flavour,
          weightLabel: `${request.weightGram / 1000} kg`,
          unitPrice: quote.quotedPrice,
          quantity: 1,
          totalPrice: quote.quotedPrice,
          eggless: request.eggless,
          inscription: request.inscription,
          image: request.referenceImages[0] || '',
        },
      ],
      pricing: {
        subtotal: quote.quotedPrice,
        discount: 0,
        deliveryFee: 0,
        tax: 0,
        totalAmount: quote.quotedPrice,
        amountPaid: 0,
        balanceDue: quote.quotedPrice - amountToPay,
      },
      orderStatus: 'pending_payment',
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      specialInstructions: request.detailedInstructions,
      customCakeRequest: request._id,
      statusHistory: [
        {
          status: 'pending_payment',
          note: `Quote accepted. Awaiting ${paymentOption === 'deposit' ? 'deposit' : 'full'} payment.`,
        },
      ],
    });

    quote.status = 'accepted';
    await quote.save();

    request.status = 'accepted';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Quote accepted! Please complete payment to confirm your custom cake baking slot.',
      orderId: order._id,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amountToPay,
      currency: 'INR',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_RichCakeShopTestKey',
    });
  } catch (error) {
    next(error);
  }
};
