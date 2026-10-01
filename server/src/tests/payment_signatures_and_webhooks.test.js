import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../config/razorpay.js';

describe('Razorpay HMAC-SHA256 Cryptographic Signatures & Webhooks', () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'RichCakeShopTestSecretKey12345';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'RichCakeShopWebhookSecret12345';

  it('should verify genuine checkout HMAC-SHA256 signatures accurately', () => {
    const orderId = 'order_test_987654';
    const paymentId = 'pay_test_123456';

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const result = verifyRazorpaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });

    expect(result).toBe(true);
  });

  it('should reject tampered or fraudulent payment signatures', () => {
    const orderId = 'order_test_987654';
    const paymentId = 'pay_test_123456';
    const fakeSignature = 'bad_forged_signature_34987523984572938475';

    const result = verifyRazorpaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: fakeSignature,
    });

    expect(result).toBe(false);
  });

  it('should verify genuine signed webhook payloads', () => {
    const sampleBody = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_123', amount: 65000 } } },
    });

    const signature = crypto.createHmac('sha256', webhookSecret).update(sampleBody).digest('hex');

    expect(verifyWebhookSignature(sampleBody, signature)).toBe(true);
    expect(verifyWebhookSignature(sampleBody, 'forged_webhook_signature')).toBe(false);
  });
});
