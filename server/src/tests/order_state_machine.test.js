import { describe, it, expect } from 'vitest';
import { Order, VALID_STATUS_TRANSITIONS } from '../models/Order.js';

describe('Order State Machine & Status Transitions', () => {
  it('should permit valid forward transitions in the delivery lifecycle', () => {
    const order = new Order({ orderStatus: 'pending_payment' });
    expect(order.canTransitionTo('confirmed')).toBe(true);
    expect(order.canTransitionTo('cancelled')).toBe(true);

    order.orderStatus = 'confirmed';
    expect(order.canTransitionTo('preparing')).toBe(true);
    expect(order.canTransitionTo('cancelled')).toBe(true);

    order.orderStatus = 'preparing';
    expect(order.canTransitionTo('ready_for_pickup')).toBe(true);
    expect(order.canTransitionTo('out_for_delivery')).toBe(true);

    order.orderStatus = 'out_for_delivery';
    expect(order.canTransitionTo('delivered')).toBe(true);
  });

  it('should strictly reject invalid backwards or illegal transitions', () => {
    const order = new Order({ orderStatus: 'delivered' });
    // Delivered is a terminal state
    expect(order.canTransitionTo('preparing')).toBe(false);
    expect(order.canTransitionTo('pending_payment')).toBe(false);
    expect(order.canTransitionTo('confirmed')).toBe(false);

    order.orderStatus = 'cancelled';
    // Cancelled can only transition to refunded
    expect(order.canTransitionTo('preparing')).toBe(false);
    expect(order.canTransitionTo('refunded')).toBe(true);
  });
});
