import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Sparkles,
  MapPin,
  User,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatRupees, formatDate } from '../utils/formatters';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address modal form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400088',
    addressType: 'home',
    isDefault: false,
  });

  // Reply note state for custom cake thread
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Re-fetch data on tab switch
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'orders') {
          const res = await api.get('/orders/my-orders');
          setOrders(res.data.orders || []);
        } else if (activeTab === 'quotes') {
          const res = await api.get('/custom-cakes/my-requests');
          setCustomRequests(res.data.requests || []);
        } else if (activeTab === 'addresses') {
          const res = await api.get('/addresses');
          setAddresses(res.data.addresses || []);
        }
      } catch (err) {
        console.warn('Error fetching account data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      setAddresses([res.data.address, ...addresses]);
      setShowAddressModal(false);
      setNewAddress({
        recipientName: user?.name || '',
        phone: user?.phone || '',
        streetAddress: '',
        landmark: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400088',
        addressType: 'home',
        isDefault: false,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendNote = async (requestId) => {
    if (!replyMessage.trim()) return;
    try {
      const res = await api.post(`/custom-cakes/${requestId}/notes`, {
        message: replyMessage.trim(),
      });
      setCustomRequests(
        customRequests.map((r) => (r._id === requestId ? res.data.request : r))
      );
      setReplyMessage('');
      setActiveReplyId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAcceptQuote = async (requestId, paymentOption = 'deposit') => {
    try {
      const res = await api.post(`/custom-cakes/${requestId}/accept-quote`, { paymentOption });
      const { orderId, orderNumber, razorpayOrderId, amountToPay, razorpayKeyId } = res.data;

      // Launch Razorpay
      const options = {
        key: razorpayKeyId || 'rzp_test_RichCakeShopTestKey',
        amount: amountToPay,
        currency: 'INR',
        name: 'Rich Cake Shop',
        description: `Custom Cake Order #${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#2C1810' },
        handler: async function (response) {
          await api.post('/orders/verify-payment', {
            orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate(`/order-confirmed/${orderNumber}`);
        },
      };

      if (typeof window.Razorpay === 'function') {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Dev fallback
        await api.post('/orders/verify-payment', {
          orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'simulated_test_signature',
        });
        navigate(`/order-confirmed/${orderNumber}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReorder = async (order) => {
    try {
      for (const item of order.items) {
        await addToCart({
          productId: item.product,
          variantId: item.variant,
          quantity: item.quantity,
          eggless: item.eggless,
          flavour: item.flavour,
          inscription: item.inscription,
        });
      }
      navigate('/cart');
    } catch (err) {
      alert(err.message || 'Unable to reorder items');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Account Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold p-0.5 flex items-center justify-center shadow-gold">
            <div className="w-full h-full bg-chocolate-900 rounded-2xl flex items-center justify-center text-gold-400 font-serif font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-chocolate-950">
              {user?.name}
            </h1>
            <p className="text-xs text-chocolate-600">
              {user?.email} • {user?.phone}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-cream-300 text-xs font-bold text-red-600 hover:bg-red-50 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cream-200 space-x-8 text-sm font-bold">
        <button
          onClick={() => handleTabChange('orders')}
          className={`pb-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-chocolate-900 text-chocolate-950'
              : 'border-transparent text-chocolate-500 hover:text-chocolate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
        </button>

        <button
          onClick={() => handleTabChange('quotes')}
          className={`pb-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'quotes'
              ? 'border-chocolate-900 text-chocolate-950'
              : 'border-transparent text-chocolate-500 hover:text-chocolate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-gold-600" />
          <span>Custom Cake Quotes</span>
        </button>

        <button
          onClick={() => handleTabChange('addresses')}
          className={`pb-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'addresses'
              ? 'border-chocolate-900 text-chocolate-950'
              : 'border-transparent text-chocolate-500 hover:text-chocolate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-chocolate-500 animate-pulse">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 p-8 space-y-4">
              <Package className="w-12 h-12 text-chocolate-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-chocolate-900">
                No orders placed yet
              </h3>
              <p className="text-xs text-chocolate-600">
                When you order cakes from our bakery, they will show up here with live status updates.
              </p>
              <Link
                to="/shop"
                className="inline-block px-6 py-2.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-chocolate-950 text-base">{o.orderNumber}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          o.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gold-100 text-gold-800'
                        }`}
                      >
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-chocolate-600">
                      Celebration Date: {formatDate(o.deliveryDate)} ({o.deliverySlotWindow})
                    </div>
                    <div className="text-xs text-chocolate-700 font-medium pt-1">
                      {o.items?.map((i) => `${i.title} (${i.weightLabel})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <span className="font-serif font-extrabold text-xl text-chocolate-950">
                      {formatRupees(o.pricing?.totalAmount)}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to={`/track/${o.orderNumber}`}
                        className="px-3.5 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-chocolate-900 text-xs font-bold transition"
                      >
                        Track Order
                      </Link>
                      <button
                        onClick={() => handleReorder(o)}
                        className="px-3.5 py-1.5 rounded-lg bg-chocolate-900 hover:bg-chocolate-800 text-gold-400 text-xs font-bold transition"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Custom Cake Quotes */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {loading ? (
            <p className="text-sm text-chocolate-500 animate-pulse">Loading quotes...</p>
          ) : customRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 p-8 space-y-4">
              <Sparkles className="w-12 h-12 text-gold-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-chocolate-900">
                No custom cake requests submitted
              </h3>
              <p className="text-xs text-chocolate-600">
                Design a multi-tier wedding cake or sculpted novelty cake to receive an official quote from our chefs.
              </p>
              <Link
                to="/custom-cake"
                className="inline-block px-6 py-2.5 rounded-xl bg-gradient-gold text-chocolate-950 font-bold text-xs shadow-sm"
              >
                Launch Custom Cake Studio
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {customRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-5"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-cream-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-lg text-chocolate-950">
                          {req.occasion} Cake • {req.weightGram / 1000} kg ({req.shape},{' '}
                          {req.tiers} {req.tiers === 1 ? 'Tier' : 'Tiers'})
                        </h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gold-100 text-gold-800">
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-chocolate-600">
                        Date Required: {formatDate(req.preferredDate)} ({req.preferredTimeSlot})
                      </span>
                    </div>

                    <span className="text-xs text-chocolate-500">
                      Submitted on {formatDate(req.createdAt)}
                    </span>
                  </div>

                  {/* Design specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3 bg-cream-50 rounded-xl">
                    <div>
                      <strong>Flavour: </strong> {req.flavour}
                    </div>
                    <div>
                      <strong>Dietary: </strong> {req.eggless ? '100% Eggless' : 'Regular'}
                    </div>
                    <div>
                      <strong>Colour Theme: </strong> {req.colourTheme}
                    </div>
                  </div>

                  <p className="text-xs text-chocolate-800 italic">
                    "{req.detailedInstructions}"
                  </p>

                  {/* Active Quote Card */}
                  {req.activeQuote ? (
                    <div className="p-4 bg-gold-50/60 rounded-2xl border border-gold-300 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase text-gold-800 tracking-wider">
                            Official Bakery Quotation
                          </span>
                          <div className="font-serif font-extrabold text-2xl text-chocolate-950">
                            {formatRupees(req.activeQuote.quotedPrice)}{' '}
                            <span className="text-xs font-normal text-chocolate-600">
                              (Deposit required: {formatRupees(req.activeQuote.depositRequired)})
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-right text-chocolate-600">
                          <div>Prep Time: {req.activeQuote.preparationTimeHours} hours</div>
                          <div className="text-red-700 font-medium">
                            Valid Until: {formatDate(req.activeQuote.validUntil)}
                          </div>
                        </div>
                      </div>

                      {req.activeQuote.adminNotes && (
                        <p className="text-xs text-chocolate-800">
                          <strong>Chef's Note: </strong> {req.activeQuote.adminNotes}
                        </p>
                      )}

                      {/* Payment Action if not already accepted */}
                      {req.status === 'quoted' && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAcceptQuote(req._id, 'deposit')}
                            className="px-4 py-2 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider hover:bg-chocolate-800 transition shadow-sm"
                          >
                            Accept & Pay Deposit ({formatRupees(req.activeQuote.depositRequired)})
                          </button>
                          <button
                            onClick={() => handleAcceptQuote(req._id, 'full')}
                            className="px-4 py-2 rounded-xl bg-gold-500 text-chocolate-950 font-bold text-xs uppercase tracking-wider hover:bg-gold-600 transition shadow-sm"
                          >
                            Pay Full Amount ({formatRupees(req.activeQuote.quotedPrice)})
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-cream-100 rounded-xl text-xs text-chocolate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-600" />
                      <span>Chef is currently reviewing design feasibility. Official quotation will appear here.</span>
                    </div>
                  )}

                  {/* Communication Notes */}
                  <div className="space-y-2 pt-2 border-t border-cream-100">
                    <span className="text-xs font-bold text-chocolate-800 block">Communication Log</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {req.communicationNotes?.map((note, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-xs ${
                            note.sender === 'admin'
                              ? 'bg-gold-50 text-chocolate-900 font-medium'
                              : 'bg-cream-100 text-chocolate-800'
                          }`}
                        >
                          <span className="font-bold uppercase text-[10px] text-chocolate-600 mr-2">
                            {note.sender === 'admin' ? "Bakery Chef" : "You"}:
                          </span>
                          <span>{note.message}</span>
                        </div>
                      ))}
                    </div>

                    {/* Reply input */}
                    {activeReplyId === req._id ? (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Type message to baker..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleSendNote(req._id)}
                          className="px-3 py-1.5 bg-chocolate-900 text-gold-400 text-xs font-bold rounded-lg"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-2 py-1.5 text-xs text-chocolate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyId(req._id)}
                        className="text-xs text-gold-700 font-bold hover:underline flex items-center gap-1 mt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Reply / Message Chef
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-xl text-chocolate-950">
              Saved Delivery Addresses
            </h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-chocolate-600 italic bg-white p-8 rounded-3xl border border-cream-200 text-center">
              No saved addresses. Add a delivery destination in Mankhurd, Chembur, or Mumbai for quick 1-click checkout.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div
                  key={a._id}
                  className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft flex justify-between items-start"
                >
                  <div className="space-y-1 text-xs text-chocolate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-chocolate-950">{a.recipientName}</span>
                      <span className="uppercase text-[10px] font-bold bg-cream-100 px-2 py-0.5 rounded">
                        {a.addressType}
                      </span>
                    </div>
                    <p>{a.streetAddress}</p>
                    {a.landmark && <p>Landmark: {a.landmark}</p>}
                    <p>
                      {a.city}, {a.state} - {a.pincode}
                    </p>
                    <p className="pt-1 font-semibold text-chocolate-900">Phone: {a.phone}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(a._id)}
                    className="text-chocolate-400 hover:text-red-500 p-1"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Address Modal */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 bg-chocolate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
                <h3 className="font-serif font-bold text-lg text-chocolate-950">
                  Add Delivery Address
                </h3>

                <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-chocolate-700 mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, recipientName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-chocolate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-chocolate-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.streetAddress}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, streetAddress: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-chocolate-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-chocolate-700 mb-1">Address Type</label>
                      <select
                        value={newAddress.addressType}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, addressType: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="px-4 py-2 border border-cream-300 rounded-xl text-chocolate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-chocolate-900 text-gold-400 font-bold rounded-xl"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
