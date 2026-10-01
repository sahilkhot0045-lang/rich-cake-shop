import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  Store,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  AlertCircle,
  MapPin,
  CheckCircle,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatRupees } from '../utils/formatters';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, clearCartState } = useCart();
  const { settings } = useStoreSettings();
  const navigate = useNavigate();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'pickup'
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400088',
  });

  // Delivery slot states
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(tomorrowStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Delivery fee & zone check
  const [deliveryFeePaise, setDeliveryFeePaise] = useState(0);
  const [zoneMessage, setZoneMessage] = useState('');
  const [zoneError, setZoneError] = useState('');

  // Payment method & Submission states
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod' | 'pay_on_pickup'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Interactive Sandbox / Simulation Modal state
  const [mockRazorpayModal, setMockRazorpayModal] = useState(null);
  const [mockProcessing, setMockProcessing] = useState(false);

  // Populate user data if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone) setCustomerPhone(user.phone);
      if (!shippingAddress.recipientName) {
        setShippingAddress((prev) => ({
          ...prev,
          recipientName: user.name,
          phone: user.phone,
        }));
      }
    }
  }, [user]);

  // Check pincode whenever delivery address pincode changes or orderType changes
  useEffect(() => {
    const checkDeliveryZone = async () => {
      if (orderType === 'pickup') {
        setDeliveryFeePaise(0);
        setZoneMessage('Bakery Pick-up in Mankhurd West, Mumbai (Free of charge)');
        setZoneError('');
        return;
      }

      if (/^[1-9][0-9]{5}$/.test(shippingAddress.pincode)) {
        try {
          const res = await api.get(`/products/check-pincode?pincode=${shippingAddress.pincode}`);
          if (res.data.isDeliverable) {
            setZoneError('');
            setZoneMessage(res.data.message);
            // If cart subtotal >= threshold, free delivery
            if (cart.pricing.subtotal >= res.data.freeDeliveryThreshold) {
              setDeliveryFeePaise(0);
            } else {
              setDeliveryFeePaise(res.data.deliveryFee);
            }
          } else {
            setZoneError(res.data.message);
            setDeliveryFeePaise(0);
          }
        } catch (err) {
          setZoneError('Unable to verify delivery zone');
        }
      }
    };

    checkDeliveryZone();
  }, [shippingAddress.pincode, orderType, cart.pricing.subtotal]);

  // Fetch slots whenever deliveryDate changes
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const res = await api.get(`/delivery/slots?date=${deliveryDate}&orderType=${orderType}`);
        if (res.data.success) {
          setAvailableSlots(res.data.slots || []);
          const firstAvailable = res.data.slots?.find((s) => s.isAvailable);
          if (firstAvailable) {
            setSelectedSlotId(firstAvailable._id);
          } else {
            setSelectedSlotId('');
          }
        }
      } catch (err) {
        console.warn('Error loading slots:', err.message);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [deliveryDate, orderType]);

  const finalPayablePaise = Math.max(0, cart.pricing.finalTotal + (orderType === 'delivery' ? deliveryFeePaise : 0));

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleCheckoutSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setCheckoutError('');

    // Comprehensive client validation
    const errors = {};

    if (!cart.items || cart.items.length === 0) {
      setCheckoutError('Your cart is empty. Please add cakes before proceeding.');
      return;
    }

    if (!customerName || !customerName.trim()) {
      errors.customerName = 'Please enter your full name.';
    }

    const digitsOnly = (customerPhone || '').replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      errors.customerPhone = 'Please provide a valid 10-digit mobile number for order updates.';
    }

    if (!customerEmail || !customerEmail.trim() || !customerEmail.includes('@')) {
      errors.customerEmail = 'Please provide a valid email address for receipt and notifications.';
    }

    if (orderType === 'delivery') {
      if (!shippingAddress.streetAddress || !shippingAddress.streetAddress.trim()) {
        errors.streetAddress = 'Please enter your street address / flat number.';
      }
      if (!shippingAddress.pincode || shippingAddress.pincode.length !== 6) {
        errors.pincode = 'Please enter a valid 6-digit PIN code.';
      }
      if (zoneError) {
        errors.pincode = zoneError;
      }
    }

    if (!selectedSlotId) {
      errors.deliverySlot = 'Please select a delivery time slot with remaining baking capacity.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      setCheckoutError(errors[firstKey]);

      const targetId =
        firstKey === 'streetAddress' || firstKey === 'pincode'
          ? `input-${firstKey}`
          : firstKey === 'deliverySlot'
          ? 'delivery-slots-section'
          : `input-${firstKey}`;

      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el.focus) el.focus();
      }
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        orderType,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
        },
        shippingAddress: orderType === 'delivery' ? shippingAddress : undefined,
        deliveryDate,
        deliverySlotId: selectedSlotId,
        specialInstructions,
        couponCode: cart.coupon?.code || undefined,
        items: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          eggless: i.eggless,
          flavour: i.flavour,
          inscription: i.inscription,
          title: i.title,
        })),
        paymentMethod,
      };

      // 1. Online Razorpay Checkout
      if (paymentMethod === 'razorpay') {
        const orderRes = await api.post('/orders/create-razorpay-order', orderPayload);
        const { orderId, orderNumber, razorpayOrderId, amount, currency, razorpayKeyId } = orderRes.data;

        // Determine if we can open live Razorpay SDK or use seamless Sandbox Simulation
        const isMockOrder =
          !razorpayOrderId ||
          razorpayOrderId.startsWith('order_sim_') ||
          razorpayKeyId === 'rzp_test_RichCakeShopTestKey';

        if (!isMockOrder && typeof window.Razorpay === 'function') {
          const options = {
            key: razorpayKeyId,
            amount,
            currency: currency || 'INR',
            name: 'Rich Cake Shop',
            description: `Order #${orderNumber}`,
            order_id: razorpayOrderId,
            prefill: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone,
            },
            theme: {
              color: '#2C1810',
            },
            handler: async function (response) {
              try {
                const verifyRes = await api.post('/orders/verify-payment', {
                  orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                if (verifyRes.data.success) {
                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                  clearCartState();
                  navigate(`/order-confirmed/${orderNumber}`);
                }
              } catch (vErr) {
                setCheckoutError(vErr.response?.data?.message || vErr.message || 'Payment signature verification failed.');
                setSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setSubmitting(false);
                setCheckoutError('Payment cancelled. Your items remain in your cart for retry.');
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (failRes) {
            setCheckoutError(`Payment failed: ${failRes.error?.description || 'Transaction declined'}`);
            setSubmitting(false);
          });
          rzp.open();
        } else {
          // Open authentic Razorpay Sandbox Simulation dialog
          setSubmitting(false);
          setMockRazorpayModal({
            orderId,
            orderNumber,
            razorpayOrderId,
            amount,
            currency: currency || 'INR',
          });
        }
      } else {
        // 2. Offline Checkout (COD or Pay on Pickup)
        const offlineRes = await api.post('/orders/create-offline-order', orderPayload);
        if (offlineRes.data.success) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          clearCartState();
          navigate(`/order-confirmed/${offlineRes.data.order.orderNumber}`);
        }
      }
    } catch (err) {
      setCheckoutError(
        err.response?.data?.message || err.message || 'Unable to place order. Please review your selections.'
      );
      setSubmitting(false);
    }
  };

  // Handler for Razorpay Sandbox Simulation completion
  const handleConfirmMockPayment = async () => {
    if (!mockRazorpayModal) return;
    setMockProcessing(true);
    try {
      const verifyRes = await api.post('/orders/verify-payment', {
        orderId: mockRazorpayModal.orderId,
        razorpay_order_id: mockRazorpayModal.razorpayOrderId,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: 'simulated_test_signature',
      });

      if (verifyRes.data.success) {
        confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
        clearCartState();
        const destOrderNumber = mockRazorpayModal.orderNumber;
        setMockRazorpayModal(null);
        navigate(`/order-confirmed/${destOrderNumber}`);
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || err.message || 'Simulation verification failed');
      setMockRazorpayModal(null);
    } finally {
      setMockProcessing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-chocolate-600">
          <Store className="w-10 h-10 text-chocolate-700" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-chocolate-950">Your Cart is Currently Empty</h2>
        <p className="text-sm text-chocolate-600 max-w-md mx-auto">
          Explore our artisanal cakes handcrafted with pure Belgian chocolate, fresh dairy cream, and celebration accents.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/cakes')}
            className="px-6 py-3 bg-chocolate-900 text-gold-400 font-bold rounded-xl shadow-soft hover:bg-chocolate-800 transition cursor-pointer"
          >
            Browse Fresh Cakes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
          Secure Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950 mt-1">
          Finalize Your Celebration Order
        </h1>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700 animate-fade-in shadow-soft">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <span className="font-bold block">Action Required:</span>
            <span>{checkoutError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-900 pb-3 border-b border-cream-100">
              1. Customer Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">Full Name *</label>
                <input
                  id="input-customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    clearFieldError('customerName');
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition border ${
                    fieldErrors.customerName ? 'border-red-400 bg-red-50/40' : 'bg-cream-50 border-cream-300'
                  }`}
                />
                {fieldErrors.customerName && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">
                  WhatsApp / Phone *
                </label>
                <input
                  id="input-customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    clearFieldError('customerPhone');
                  }}
                  placeholder="e.g. 9820098200"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition border ${
                    fieldErrors.customerPhone ? 'border-red-400 bg-red-50/40' : 'bg-cream-50 border-cream-300'
                  }`}
                />
                {fieldErrors.customerPhone && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerPhone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-chocolate-700 mb-1">Email Address *</label>
                <input
                  id="input-customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    clearFieldError('customerEmail');
                  }}
                  placeholder="For invoice, payment receipt & status updates"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition border ${
                    fieldErrors.customerEmail ? 'border-red-400 bg-red-50/40' : 'bg-cream-50 border-cream-300'
                  }`}
                />
                {fieldErrors.customerEmail && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Order Type & Delivery Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-900 pb-3 border-b border-cream-100">
              2. Delivery or Bakery Pick-up
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'border-chocolate-900 bg-chocolate-900 text-gold-400 font-bold shadow-sm'
                    : 'border-cream-300 bg-white text-chocolate-700 hover:bg-cream-50'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span className="text-sm">Home Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderType('pickup');
                  if (paymentMethod === 'cod') setPaymentMethod('pay_on_pickup');
                }}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 cursor-pointer ${
                  orderType === 'pickup'
                    ? 'border-chocolate-900 bg-chocolate-900 text-gold-400 font-bold shadow-sm'
                    : 'border-cream-300 bg-white text-chocolate-700 hover:bg-cream-50'
                }`}
              >
                <Store className="w-5 h-5" />
                <span className="text-sm">Pick-up from Bakery</span>
              </button>
            </div>

            {orderType === 'delivery' ? (
              <div className="space-y-4 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-chocolate-700 mb-1">
                      Street Address / Flat / Building *
                    </label>
                    <input
                      id="input-streetAddress"
                      type="text"
                      value={shippingAddress.streetAddress}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, streetAddress: e.target.value });
                        clearFieldError('streetAddress');
                      }}
                      placeholder="e.g. Flat 402, Crystal Heights, Station Rd"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition border ${
                        fieldErrors.streetAddress ? 'border-red-400 bg-red-50/40' : 'bg-cream-50 border-cream-300'
                      }`}
                    />
                    {fieldErrors.streetAddress && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.streetAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-700 mb-1">PIN Code *</label>
                    <input
                      id="input-pincode"
                      type="text"
                      maxLength={6}
                      value={shippingAddress.pincode}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, pincode: e.target.value });
                        clearFieldError('pincode');
                      }}
                      placeholder="e.g. 400088"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-gold-500 transition border ${
                        fieldErrors.pincode ? 'border-red-400 bg-red-50/40' : 'bg-cream-50 border-cream-300'
                      }`}
                    />
                    {fieldErrors.pincode && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.pincode}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-chocolate-700 mb-1">Landmark</label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, landmark: e.target.value })
                      }
                      placeholder="Near Mankhurd Station / Sion-Panvel Highway"
                      className="w-full px-3.5 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-700 mb-1">City / State</label>
                    <input
                      type="text"
                      disabled
                      value="Mumbai, Maharashtra"
                      className="w-full px-3.5 py-2.5 text-sm bg-cream-200/50 border border-cream-300 rounded-xl text-chocolate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {zoneMessage && !zoneError && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{zoneMessage}</span>
                  </div>
                )}
                {zoneError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                    {zoneError}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 text-xs text-chocolate-800 space-y-1">
                <span className="font-bold text-sm text-chocolate-950 block">Bakery Collection Address:</span>
                <p>
                  {settings?.address?.shopNo || 'Shop #4, Sai Heritage'}, {settings?.address?.street || 'Station Road'}, {settings?.address?.locality || 'Mankhurd West'}, Mumbai - {settings?.address?.pincode || '400088'}
                </p>
                <p className="text-chocolate-600 pt-1">
                  Collection Hours: 09:00 AM - 10:00 PM (Orders kept ready in temperature-controlled cooler)
                </p>
              </div>
            )}
          </div>

          {/* 3. Celebration Date & Delivery Slot Picker */}
          <div id="delivery-slots-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-900 pb-3 border-b border-cream-100 flex items-center justify-between">
              <span>3. Preferred Date & Time Slot</span>
              <span className="text-xs font-normal text-gold-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Capacity Protected
              </span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">
                  Celebration Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full sm:w-60 px-3.5 py-2 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-2">
                  Available Slots ({availableSlots.length} options) *
                </label>

                {loadingSlots ? (
                  <p className="text-xs text-chocolate-500 animate-pulse">Checking baking capacities...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => {
                          setSelectedSlotId(slot._id);
                          clearFieldError('deliverySlot');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          selectedSlotId === slot._id
                            ? 'border-chocolate-900 bg-chocolate-900 text-gold-400 font-bold shadow-sm'
                            : slot.isAvailable
                            ? 'border-cream-300 bg-cream-50 text-chocolate-800 hover:border-chocolate-400'
                            : 'border-cream-200 bg-cream-100/50 text-chocolate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="text-xs font-bold">{slot.slotName}</div>
                        <div className="text-[11px] mt-1">
                          {slot.isAvailable ? (
                            <span className="text-emerald-600 font-medium">
                              {slot.remainingCapacity} slots remaining
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">{slot.reason}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {fieldErrors.deliverySlot && (
                  <p className="text-xs text-red-600 mt-2 font-medium">{fieldErrors.deliverySlot}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-700 mb-1">
                Special Delivery Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Ring bell twice, deliver to security, call before arrival"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Payment Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-900 pb-3 border-b border-cream-100">
              4. Payment Method
            </h3>

            <div className="space-y-3">
              {/* Online Razorpay */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-gold-500 bg-gold-50/40 ring-1 ring-gold-500'
                    : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-gold-600 focus:ring-gold-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-chocolate-800" />
                    <span className="font-bold text-sm text-chocolate-950">
                      Razorpay Online Payment (Recommended)
                    </span>
                  </div>
                  <span className="text-xs text-chocolate-600 block mt-1">
                    Instant confirmation via UPI (Google Pay, PhonePe, Paytm), All Debit/Credit Cards & NetBanking.
                  </span>
                </div>
              </label>

              {/* Cash On Delivery (if applicable) */}
              {orderType === 'delivery' && settings?.paymentOptions?.allowCashOnDelivery && (
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-gold-500 bg-gold-50/40 ring-1 ring-gold-500'
                      : 'border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-gold-600 focus:ring-gold-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-chocolate-800" />
                      <span className="font-bold text-sm text-chocolate-950">Cash on Delivery</span>
                    </div>
                    <span className="text-xs text-chocolate-600 block mt-1">
                      Pay cash upon delivery. Subject to local Mankhurd/Mumbai coverage limit (₹3,000 max).
                    </span>
                  </div>
                </label>
              )}

              {/* Pay on Pickup */}
              {orderType === 'pickup' && settings?.paymentOptions?.allowPayOnPickup && (
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'pay_on_pickup'
                      ? 'border-gold-500 bg-gold-50/40 ring-1 ring-gold-500'
                      : 'border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'pay_on_pickup'}
                    onChange={() => setPaymentMethod('pay_on_pickup')}
                    className="mt-1 text-gold-600 focus:ring-gold-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-chocolate-800" />
                      <span className="font-bold text-sm text-chocolate-950">Pay at Bakery Counter</span>
                    </div>
                    <span className="text-xs text-chocolate-600 block mt-1">
                      Pay via Cash or Card swipe when picking up your cake at our Mankhurd store.
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100 flex items-center justify-between">
              <span>Order Review</span>
              <span className="text-xs font-semibold text-chocolate-500 font-sans">
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
              </span>
            </h3>

            {/* Itemized Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-xs">
                  <div className="pr-3">
                    <span className="font-bold text-chocolate-900 block truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <span className="text-chocolate-500">
                      {item.weightLabel} • Qty {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-chocolate-900 shrink-0">
                    {formatRupees(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-cream-100 text-sm text-chocolate-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-chocolate-900">
                  {formatRupees(cart.pricing.subtotal)}
                </span>
              </div>

              {cart.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({cart.coupon?.code})</span>
                  <span className="font-semibold">-{formatRupees(cart.pricing.discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                <span className="font-semibold text-chocolate-900">
                  {orderType === 'pickup' ? (
                    <span className="text-emerald-700">FREE (Pick-up)</span>
                  ) : deliveryFeePaise === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    formatRupees(deliveryFeePaise)
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-cream-200 flex justify-between items-baseline">
              <div>
                <span className="font-serif font-bold text-lg text-chocolate-950">Grand Total</span>
                <span className="text-xs text-chocolate-500 block">All taxes included</span>
              </div>
              <span className="font-serif font-extrabold text-2xl text-chocolate-950">
                {formatRupees(finalPayablePaise)}
              </span>
            </div>

            {/* Prominent Sidebar Error Notice */}
            {checkoutError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span className="font-medium leading-relaxed">{checkoutError}</span>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              type="submit"
              id="checkout-submit-btn"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-base hover:bg-chocolate-800 active:scale-[0.99] transition shadow-card flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
                  <span>Connecting to Razorpay...</span>
                </span>
              ) : (
                <span>
                  {paymentMethod === 'razorpay' ? 'Proceed to Razorpay Payment' : 'Confirm Order'} •{' '}
                  {formatRupees(finalPayablePaise)}
                </span>
              )}
            </button>

            <div className="text-[11px] text-chocolate-500 text-center leading-relaxed">
              By confirming, you agree to Rich Cake Shop's{' '}
              <a href="/policies/refunds" className="text-gold-700 underline" target="_blank" rel="noreferrer">
                24h Cancellation & Refund Policy
              </a>
              .
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay Sandbox / Development Simulation Modal */}
      {mockRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-cream-200">
            {/* Header */}
            <div className="bg-chocolate-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold-500 text-chocolate-950 font-extrabold flex items-center justify-center text-sm shadow-sm">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gold-300">Razorpay Payment Gateway</h4>
                  <span className="text-[11px] text-cream-200">Sandbox Test Mode</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMockRazorpayModal(null)}
                className="text-cream-300 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 flex justify-between items-center">
                <div>
                  <span className="text-xs text-chocolate-600 block">Total Amount Payable:</span>
                  <span className="font-serif font-extrabold text-2xl text-chocolate-950">
                    {formatRupees(mockRazorpayModal.amount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-chocolate-500 block">Order Reference</span>
                  <span className="font-mono text-xs font-bold text-chocolate-800">
                    {mockRazorpayModal.orderNumber}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-chocolate-700">
                <p className="font-semibold text-chocolate-900">Select Test Payment Mode:</p>
                <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 flex items-center justify-between">
                  <span>⚡ Instant UPI (Google Pay, PhonePe, Paytm)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Fastest
                  </span>
                </div>
                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-center justify-between text-chocolate-600">
                  <span>💳 All Major Cards / NetBanking</span>
                  <span className="text-[10px] text-chocolate-500">Verified</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={mockProcessing}
                  onClick={handleConfirmMockPayment}
                  className="w-full py-3.5 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {mockProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptographic Signature...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Simulate Successful Payment • {formatRupees(mockRazorpayModal.amount)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={mockProcessing}
                  onClick={() => {
                    setMockRazorpayModal(null);
                    setCheckoutError('Payment simulation cancelled by user.');
                  }}
                  className="w-full py-2.5 rounded-xl text-chocolate-600 text-xs hover:bg-cream-100 transition cursor-pointer"
                >
                  Cancel and Return to Checkout
                </button>
              </div>

              <div className="text-[10px] text-center text-chocolate-400">
                🔒 256-Bit SSL Encrypted Razorpay Sandbox Checkout for Rich Cake Shop
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
