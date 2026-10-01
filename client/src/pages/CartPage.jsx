import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupees } from '../utils/formatters';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await applyCoupon(couponCode.trim());
      setCouponSuccess(res.message);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponSuccess('');
      setCouponError('');
    } catch (err) {
      setCouponError(err.message);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-chocolate-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-chocolate-950">
          Your Cake Cart is Empty
        </h2>
        <p className="text-sm text-chocolate-600 max-w-md mx-auto">
          Explore our collection of fresh Belgian chocolates, exotic seasonal mango gateaux, and artisanal celebration cakes.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-sm hover:bg-chocolate-800 transition shadow-card"
        >
          <span>Explore Cake Catalogue</span>
          <ArrowRight className="w-4 h-4 text-gold-400" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-chocolate-700 hover:text-gold-600 mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950">
          Your Cake Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-soft divide-y divide-cream-100 overflow-hidden">
            {cart.items.map((item) => (
              <div key={item._id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                {/* Cake Image */}
                <Link
                  to={`/product/${item.slug}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-cream-100 shrink-0 border border-cream-200"
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-chocolate-900 hover:text-gold-600 transition">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-chocolate-600">
                        <span className="font-semibold text-chocolate-800">{item.weightLabel}</span>
                        <span>•</span>
                        <span>{item.flavour}</span>
                        {item.eggless && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                              100% Eggless
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-chocolate-400 hover:text-red-500 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inscription preview */}
                  {item.inscription && (
                    <div className="text-xs bg-cream-50 p-2 rounded-lg border border-cream-200 text-chocolate-800">
                      <span className="font-bold text-chocolate-900">Piping Message: </span>
                      <span className="italic font-serif">"{item.inscription}"</span>
                    </div>
                  )}

                  {/* Quantity & Item Subtotal */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-chocolate-800 hover:bg-cream-100 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-chocolate-950">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-chocolate-800 hover:bg-cream-100 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-chocolate-950">
                        {formatRupees(item.totalPrice)}
                      </div>
                      <div className="text-[11px] text-chocolate-500">
                        {formatRupees(item.unitPrice)} each
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-3">
            <h4 className="font-serif font-bold text-sm text-chocolate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gold-600" />
              Apply Bakery Coupon
            </h4>

            {cart.coupon ? (
              <div className="flex items-center justify-between p-3 bg-gold-50 border border-gold-300 rounded-xl">
                <div>
                  <span className="font-bold text-sm text-gold-900">{cart.coupon.code}</span>
                  <span className="text-xs text-gold-700 block">
                    Discount: {formatRupees(cart.coupon.discountAmount)}
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 uppercase font-semibold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-emerald-700">{couponSuccess}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100">
              Order Summary
            </h3>

            <div className="space-y-2 text-sm text-chocolate-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-chocolate-900">
                  {formatRupees(cart.pricing.subtotal)}
                </span>
              </div>

              {cart.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{formatRupees(cart.pricing.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-chocolate-500 pt-1">
                <span>Delivery Charges</span>
                <span>Calculated at checkout (Free above ₹1,000)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-cream-200 flex justify-between items-baseline">
              <div>
                <span className="font-serif font-bold text-lg text-chocolate-950">Estimated Total</span>
                <span className="block text-[11px] text-chocolate-500">Includes all taxes</span>
              </div>
              <span className="font-serif font-extrabold text-2xl text-chocolate-950">
                {formatRupees(cart.pricing.finalTotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-base hover:bg-chocolate-800 hover:scale-[1.01] active:scale-[0.99] transition shadow-card flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>

            <div className="pt-2 text-center text-xs text-chocolate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>Razorpay Secured 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
