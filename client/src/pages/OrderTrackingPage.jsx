import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Store,
  Printer,
  Calendar,
  AlertCircle,
  MapPin,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import api from '../api/axios';
import { formatRupees, formatDate } from '../utils/formatters';

const STATUS_STEPS_DELIVERY = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Baking & Styling', icon: Clock },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

const STATUS_STEPS_PICKUP = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Baking & Styling', icon: Clock },
  { key: 'ready_for_pickup', label: 'Ready for Collection', icon: Store },
  { key: 'delivered', label: 'Collected at Bakery', icon: Package },
];

const OrderTrackingPage = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const location = useLocation();
  const isConfirmation = location.pathname.startsWith('/order-confirmed');

  const [searchInput, setSearchInput] = useState(paramOrderNumber || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchOrder = async (num) => {
    if (!num) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/orders/track/${num.trim()}`);
      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError(`Order #${num} could not be retrieved.`);
        setOrder(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || `Order #${num} not found. Please verify the order reference number.`
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      fetchOrder(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  useEffect(() => {
    if (isConfirmation && order) {
      // Fire confetti burst upon loading confirmation
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [isConfirmation, order?._id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchOrder(searchInput.trim());
    }
  };

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getStepStatus = (stepKey) => {
    if (!order) return 'upcoming';
    const status = order.orderStatus || 'confirmed';

    if (status === 'cancelled') return 'cancelled';
    if (status === 'refunded') return 'refunded';

    const orderSteps =
      order.orderType === 'pickup'
        ? ['pending_payment', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered']
        : ['pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

    const currentIndex = orderSteps.indexOf(status);
    const stepIndex = orderSteps.indexOf(stepKey);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      {/* 1. Celebration Header for Order Confirmation */}
      {isConfirmation && order && (
        <div className="bg-gradient-to-br from-emerald-50 via-cream-50 to-gold-50/50 border border-emerald-200/80 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-card animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-emerald-800" />
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce-subtle">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full inline-block">
              Payment Confirmed • Fresh Baking Queued
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950 pt-1">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-chocolate-700 max-w-xl mx-auto pt-1">
              Dear <strong className="text-chocolate-950">{order.customer?.name || 'Customer'}</strong>, your cake order has been verified and sent directly to our Mankhurd West kitchen.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider hover:bg-chocolate-800 transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>

            <Link
              to="/shop"
              className="px-5 py-2.5 rounded-xl border border-cream-300 bg-white text-chocolate-800 font-bold text-xs uppercase tracking-wider hover:bg-cream-50 transition flex items-center gap-1 shadow-xs"
            >
              <span>Explore More Cakes</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Manual Search Header (Shown when not on confirmation, or as lookup) */}
      {!isConfirmation && (
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Real-Time Bakery Status
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950">
            Live Order Tracking
          </h1>
          <p className="text-sm text-chocolate-600">
            Enter your order reference number (e.g. RC-202609-XXXX) to track celebration milestones and view your invoice.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order # (e.g. RC-202609-XXXX)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 uppercase font-semibold"
              />
              <Search className="w-4 h-4 text-chocolate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition shadow-sm cursor-pointer"
            >
              Track
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 space-y-3 text-chocolate-600">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium animate-pulse">Locating bakery order records...</p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-sm text-red-700 animate-fade-in shadow-soft">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <span className="font-bold block">Notice:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-fade-in">
          {/* Order Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-serif font-extrabold text-2xl text-chocolate-950 font-mono">
                  {order.orderNumber}
                </span>

                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="px-2.5 py-1 rounded-lg border border-cream-300 text-chocolate-600 hover:text-chocolate-900 hover:bg-cream-100 text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Copy Order Reference Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    order.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : order.orderStatus === 'refunded'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gold-100 text-gold-800'
                  }`}
                >
                  {(order.orderStatus || 'confirmed').replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs text-chocolate-600 mt-2 flex flex-wrap items-center gap-2">
                <span>Placed on {formatDate(order.createdAt)}</span>
                <span>•</span>
                <span>Payment: {(order.paymentMethod || 'razorpay').toUpperCase()}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  Status: {(order.paymentStatus || 'paid').toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 text-chocolate-800 hover:bg-cream-100 text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 text-chocolate-600" />
              <span>Print Invoice</span>
            </button>
          </div>

          {/* Stepper Status Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 flex items-center justify-between">
              <span>Celebration Progress Tracker</span>
              <span className="text-xs font-normal text-gold-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Live Bakery Feed
              </span>
            </h3>

            {order.orderStatus === 'cancelled' ? (
              <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-sm border border-red-200">
                <strong>Order Cancelled:</strong> {order.cancellationReason || 'Cancelled as requested.'}
              </div>
            ) : order.orderStatus === 'refunded' ? (
              <div className="p-4 bg-purple-50 text-purple-800 rounded-2xl text-sm border border-purple-200">
                <strong>Payment Refunded:</strong> Amount has been reversed according to store policy.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(order.orderType === 'pickup' ? STATUS_STEPS_PICKUP : STATUS_STEPS_DELIVERY).map(
                  (step, idx) => {
                    const st = getStepStatus(step.key);
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-center transition ${
                          st === 'completed'
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                            : st === 'current'
                            ? 'border-gold-500 bg-gold-50/60 text-chocolate-950 ring-2 ring-gold-400'
                            : 'border-cream-200 bg-cream-50/50 text-chocolate-400'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 ${
                            st === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : st === 'current'
                              ? 'bg-gold-500 text-chocolate-950 font-bold shadow-sm'
                              : 'bg-cream-200 text-chocolate-400'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-xs">{step.label}</div>
                        <div className="text-[10px] uppercase font-semibold mt-1">
                          {st === 'completed'
                            ? 'Completed'
                            : st === 'current'
                            ? 'In Progress'
                            : 'Pending'}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <p className="text-xs text-chocolate-500 italic text-center pt-2">
              Note: Every cake is freshly baked and chilled before dispatch to ensure optimal celebration quality.
            </p>
          </div>

          {/* Delivery & Schedule Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-3">
              <h4 className="font-serif font-bold text-base text-chocolate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-600" />
                Schedule & Fulfillment
              </h4>
              <div className="text-xs text-chocolate-700 space-y-2">
                <div>
                  <span className="font-bold text-chocolate-900">Celebration Date: </span>
                  <span>{formatDate(order.deliveryDate)}</span>
                </div>
                <div>
                  <span className="font-bold text-chocolate-900">Time Window: </span>
                  <span className="font-semibold text-chocolate-950">
                    {order.deliverySlotWindow || order.deliverySlot?.slotName || 'Standard Bakery Slot'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-chocolate-900">Order Method: </span>
                  <span className="capitalize">{order.orderType === 'delivery' ? 'Home Delivery' : 'Bakery Pickup'}</span>
                </div>
                {order.specialInstructions && (
                  <div className="p-2.5 bg-cream-50 rounded-xl border border-cream-200 text-chocolate-600 italic">
                    Note: "{order.specialInstructions}"
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-3">
              <h4 className="font-serif font-bold text-base text-chocolate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-600" />
                Recipient & Destination
              </h4>
              <div className="text-xs text-chocolate-700 space-y-2">
                <div>
                  <span className="font-bold text-chocolate-900">Customer: </span>
                  <span>{order.customer?.name} ({order.customer?.phone})</span>
                </div>
                {order.orderType === 'delivery' && order.shippingAddress ? (
                  <div>
                    <span className="font-bold text-chocolate-900">Delivery Address: </span>
                    <p className="mt-0.5 text-chocolate-800 leading-relaxed">
                      {order.shippingAddress.streetAddress}
                      {order.shippingAddress.landmark ? `, Near ${order.shippingAddress.landmark}` : ''},
                      <br />
                      {order.shippingAddress.city || 'Mumbai'}, Maharashtra - {order.shippingAddress.pincode}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-chocolate-900">Bakery Collection Address: </span>
                    <p className="mt-0.5 text-chocolate-800 leading-relaxed">
                      Rich Cake Shop, Shop #4, Sai Heritage, Station Road,
                      <br />
                      Mankhurd West, Mumbai - 400088
                    </p>
                    <span className="text-[11px] text-chocolate-500 block pt-1">
                      Pick-up Window: 09:00 AM - 10:00 PM
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h4 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100 flex items-center justify-between">
              <span>Itemized Invoice Summary</span>
              <span className="text-xs text-chocolate-500 font-sans font-normal">
                {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
              </span>
            </h4>

            <div className="divide-y divide-cream-100">
              {order.items?.map((it, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-chocolate-900 text-sm block">{it.title}</span>
                    <span className="text-chocolate-600">
                      {it.weightLabel} • {it.flavour || 'Artisanal'} • Qty {it.quantity}
                    </span>
                    {it.inscription && (
                      <span className="block text-chocolate-500 italic mt-0.5">
                        Inscription: "{it.inscription}"
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-chocolate-950 text-sm">
                    {formatRupees(it.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-cream-200 space-y-1.5 text-xs text-chocolate-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatRupees(order.pricing?.subtotal || 0)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatRupees(order.pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {order.pricing?.deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatRupees(order.pricing?.deliveryFee || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-extrabold text-chocolate-950 pt-2 border-t border-cream-100">
                <span>Total Amount Paid</span>
                <span>{formatRupees(order.pricing?.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Customer Support Notice */}
          <div className="p-5 bg-cream-100/70 border border-cream-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-chocolate-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-600" />
              <span>Questions about your celebration cake? Call our bakery counter directly at <strong>+91 98200 98200</strong>.</span>
            </div>
            <Link
              to="/contact"
              className="text-gold-700 hover:text-gold-800 font-bold underline shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
