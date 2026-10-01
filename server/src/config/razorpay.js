import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_RichCakeShopTestKey';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'RichCakeShopTestSecretKey12345';
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

/**
 * Verify Razorpay Checkout client signature
 * Generated using HMAC SHA256 of order_id + "|" + payment_id with key_secret
 */
export const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'RichCakeShopTestSecretKey12345';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  return generatedSignature === razorpay_signature;
};

/**
 * Verify Razorpay Webhook signature
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'RichCakeShopWebhookSecret12345';
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
};
