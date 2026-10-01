import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { Refund } from '../models/Refund.js';
import { verifyWebhookSignature } from '../config/razorpay.js';

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'RichCakeShopWebhookSecret12345';

    // Verify webhook signature
    const isValid = verifyWebhookSignature(JSON.stringify(req.body), signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (!payload || !payload.payment) {
      return res.status(200).json({ status: 'ignored' });
    }

    const paymentEntity = payload.payment.entity;
    const rzpOrderId = paymentEntity.order_id;
    const rzpPaymentId = paymentEntity.id;
    const eventId = req.body.event_id || `${event}_${rzpPaymentId}`;

    // Idempotency check
    const existingPayment = await Payment.findOne({ webhookEventId: eventId });
    if (existingPayment) {
      return res.status(200).json({ status: 'already_processed' });
    }

    if (event === 'payment.captured') {
      const order = await Order.findOne({ 'pricing.totalAmount': paymentEntity.amount });
      if (order && order.paymentStatus !== 'paid') {
        order.orderStatus = 'confirmed';
        order.paymentStatus = 'paid';
        order.pricing.amountPaid = paymentEntity.amount;
        order.pricing.balanceDue = 0;
        order.statusHistory.push({
          status: 'confirmed',
          note: `Webhook verified: payment captured (${rzpPaymentId})`,
        });
        await order.save();
      }

      await Payment.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        {
          razorpayPaymentId: rzpPaymentId,
          status: 'captured',
          webhookEventId: eventId,
          method: paymentEntity.method,
        },
        { upsert: true }
      );
    } else if (event === 'payment.failed') {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        {
          status: 'failed',
          webhookEventId: eventId,
          errorDescription: paymentEntity.error_description || 'Payment failed via gateway',
        },
        { upsert: true }
      );
    } else if (event === 'refund.processed') {
      const refundEntity = payload.refund ? payload.refund.entity : null;
      if (refundEntity) {
        await Refund.create({
          razorpayRefundId: refundEntity.id,
          amount: refundEntity.amount,
          reason: refundEntity.notes?.reason || 'Webhook refund processed',
          status: 'processed',
        });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
