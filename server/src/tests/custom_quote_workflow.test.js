import { describe, it, expect } from 'vitest';
import { calculateIndicativePrice } from '../controllers/customCakeController.js';
import { Quote } from '../models/Quote.js';

describe('Custom Cake Workflow & Indicative Pricing', () => {
  it('should calculate indicative price range proportionally with weight, tiers, and sculpting', () => {
    // 1kg single tier round cake
    const est1 = calculateIndicativePrice({ weightGram: 1000, tiers: 1, shape: 'Round' });
    expect(est1.estimatedMinPaise).toBeGreaterThan(0);
    expect(est1.estimatedMaxPaise).toBeGreaterThan(est1.estimatedMinPaise);

    // 3kg two-tier sculpted cake should cost significantly more
    const est2 = calculateIndicativePrice({ weightGram: 3000, tiers: 2, shape: 'Custom Sculpted' });
    expect(est2.estimatedMinPaise).toBeGreaterThan(est1.estimatedMinPaise);
  });

  it('should detect when a custom quote validity has expired', () => {
    const activeQuote = new Quote({
      customCakeRequest: '64b1f2a3c9e77b1234567890',
      admin: '64b1f2a3c9e77b1234567891',
      quotedPrice: 350000,
      depositRequired: 175000,
      preparationTimeHours: 48,
      validUntil: new Date(Date.now() + 100000),
    });
    expect(activeQuote.isExpired()).toBe(false);

    const expiredQuote = new Quote({
      customCakeRequest: '64b1f2a3c9e77b1234567890',
      admin: '64b1f2a3c9e77b1234567891',
      quotedPrice: 350000,
      depositRequired: 175000,
      preparationTimeHours: 48,
      validUntil: new Date(Date.now() - 50000),
    });
    expect(expiredQuote.isExpired()).toBe(true);
  });
});
