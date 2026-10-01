import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
  },
  title: {
    type: String,
    required: true,
  },
  flavour: {
    type: String,
    required: true,
  },
  weightLabel: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number, // In paise
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number, // In paise
    required: true,
  },
  eggless: {
    type: Boolean,
    default: true,
  },
  inscription: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    orderType: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
      default: 'delivery',
    },
    shippingAddress: {
      recipientName: String,
      phone: String,
      streetAddress: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
    },
    deliveryDate: {
      type: Date,
      required: true,
      index: true,
    },
    deliverySlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliverySlot',
      required: true,
    },
    deliverySlotWindow: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true }, // in paise
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      amountPaid: { type: Number, default: 0 },
      balanceDue: { type: Number, default: 0 },
    },
    orderStatus: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending_payment',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod', 'pay_on_pickup'],
      required: true,
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial_deposit', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    customCakeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomCakeRequest',
    },
    cancellationReason: String,
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Valid status transitions map
export const VALID_STATUS_TRANSITIONS = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

orderSchema.methods.canTransitionTo = function (nextStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[this.orderStatus] || [];
  return allowed.includes(nextStatus);
};

export const Order = mongoose.model('Order', orderSchema);
