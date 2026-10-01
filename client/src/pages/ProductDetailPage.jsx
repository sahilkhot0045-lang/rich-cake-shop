import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  MapPin,
  AlertCircle,
  ChevronRight,
  Info,
} from 'lucide-react';
import api from '../api/axios';
import { formatRupees } from '../utils/formatters';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [isEggless, setIsEggless] = useState(true);
  const [inscription, setInscription] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState('400088'); // Default Mankhurd
  const [pincodeCheckResult, setPincodeCheckResult] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Review modal state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setReviews(res.data.reviews || []);
          setActiveImage(prod.images[0] || '');
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
          if (prod.flavours && prod.flavours.length > 0) {
            setSelectedFlavour(prod.flavours[0]);
          }
          setIsEggless(prod.isEgglessAvailable);
        }
      } catch (err) {
        console.warn('Error loading product:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Initial pincode check
  useEffect(() => {
    if (pincode) {
      handleCheckPincode();
    }
  }, []);

  const handleCheckPincode = async (e) => {
    if (e) e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeCheckResult({
        isDeliverable: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      });
      return;
    }

    try {
      setCheckingPincode(true);
      const res = await api.get(`/products/check-pincode?pincode=${pincode}`);
      setPincodeCheckResult(res.data);
    } catch (err) {
      setPincodeCheckResult({ isDeliverable: false, message: err.message });
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    try {
      await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
        eggless: isEggless,
        flavour: selectedFlavour,
        inscription: inscription.trim(),
        specialInstructions: specialInstructions.trim(),
      });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    try {
      setReviewSubmitting(true);
      const res = await api.post('/reviews', {
        productId: product._id,
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        flavourMentioned: selectedFlavour,
      });
      setReviewSuccessMsg(res.data.message);
      setReviewName('');
      setReviewComment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-96 bg-cream-200 rounded-3xl max-w-2xl mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-chocolate-900">Cake Not Found</h2>
        <p className="text-chocolate-600">The cake you are looking for is currently unavailable.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-chocolate-900 text-gold-400 font-bold"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const currentPricePaise = selectedVariant ? selectedVariant.price : product.basePrice;
  const originalPricePaise = product.discountPercent
    ? Math.round(currentPricePaise / (1 - product.discountPercent / 100))
    : currentPricePaise;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-chocolate-600">
        <Link to="/" className="hover:text-gold-600">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-chocolate-400" />
        <Link to="/shop" className="hover:text-gold-600">
          Catalogue
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-chocolate-400" />
        <span className="font-bold text-chocolate-900 truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-cream-100 border border-cream-200 shadow-soft relative group">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.discountPercent > 0 && (
              <div className="absolute top-4 right-4 bg-gold-500 text-chocolate-950 font-bold text-xs px-3 py-1 rounded-full shadow-md">
                {product.discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-gold-500 shadow-sm' : 'border-cream-300 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value props strip */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-cream-200 text-center text-xs text-chocolate-700">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-gold-600 mb-1" />
              <span className="font-semibold">Pure Ingredients</span>
              <span className="text-[10px] text-chocolate-500">100% Belgian Cocoa</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-5 h-5 text-gold-600 mb-1" />
              <span className="font-semibold">{product.preparationTimeHours}h Prep Time</span>
              <span className="text-[10px] text-chocolate-500">Baked to Order</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-gold-600 mb-1" />
              <span className="font-semibold">Chilled Delivery</span>
              <span className="text-[10px] text-chocolate-500">Doorstep Protected</span>
            </div>
          </div>
        </div>

        {/* Right Configuration (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-gold-700 font-bold uppercase tracking-wider mb-2">
              <span>{product.category?.name || 'Artisanal Cake'}</span>
              <div className="flex items-center gap-1 text-chocolate-800">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                <span>{product.ratingsAverage.toFixed(1)}</span>
                <span className="text-chocolate-400 font-normal">({product.ratingsQuantity} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950 leading-tight">
              {product.title}
            </h1>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="font-serif font-extrabold text-chocolate-950 text-3xl">
                {formatRupees(currentPricePaise)}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-base text-chocolate-400 line-through">
                  {formatRupees(originalPricePaise)}
                </span>
              )}
              <span className="text-xs text-chocolate-500 font-medium">
                (Inclusive of all taxes)
              </span>
            </div>

            <p className="text-sm text-chocolate-700 mt-4 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Weight Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-cream-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-chocolate-900 uppercase tracking-wider">
                  Select Cake Weight & Servings
                </span>
                <span className="text-gold-700 font-medium">{product.servingGuide}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedVariant?._id === v._id
                        ? 'border-chocolate-900 bg-chocolate-900 text-white shadow-sm'
                        : 'border-cream-300 bg-white hover:border-chocolate-400 text-chocolate-800'
                    }`}
                  >
                    <div className="font-bold text-sm">{v.weightLabel}</div>
                    <div
                      className={`text-xs mt-0.5 ${
                        selectedVariant?._id === v._id ? 'text-gold-300 font-semibold' : 'text-chocolate-600'
                      }`}
                    >
                      {formatRupees(v.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavour Options */}
          {product.flavours && product.flavours.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-cream-200">
              <span className="text-xs font-bold text-chocolate-900 uppercase tracking-wider block">
                Choose Flavour Pairing
              </span>
              <div className="flex flex-wrap gap-2">
                {product.flavours.map((flv, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedFlavour(flv)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedFlavour === flv
                        ? 'bg-gold-500 text-chocolate-950 border-gold-600 shadow-sm'
                        : 'bg-cream-50 text-chocolate-700 border-cream-300 hover:border-chocolate-500'
                    }`}
                  >
                    {flv}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Eggless Preference Checkbox */}
          <div className="pt-2 border-t border-cream-200">
            <label className="flex items-center gap-3 p-3 bg-cream-100 rounded-xl border border-cream-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isEggless}
                onChange={(e) => setIsEggless(e.target.checked)}
                className="w-5 h-5 rounded text-gold-600 focus:ring-gold-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-sm text-chocolate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Bake as 100% Eggless
                </span>
                <span className="text-xs text-chocolate-600 block">
                  Prepared in our dedicated vegetarian artisanal mixing station
                </span>
              </div>
            </label>
          </div>

          {/* Custom Inscription on Cake */}
          <div className="space-y-2 pt-2 border-t border-cream-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-chocolate-900 uppercase tracking-wider">
                Message / Name on Cake (Free Piping)
              </span>
              <span className="text-chocolate-500">{inscription.length} / 50 characters</span>
            </div>
            <input
              type="text"
              maxLength={50}
              placeholder="e.g. Happy Birthday Aanya!"
              value={inscription}
              onChange={(e) => setInscription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {/* Add to Cart Bar */}
          <div className="pt-4 border-t border-cream-200 flex items-center gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-cream-300 rounded-xl bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center font-bold text-chocolate-700 hover:bg-cream-100 rounded-lg"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-sm text-chocolate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center font-bold text-chocolate-700 hover:bg-cream-100 rounded-lg"
              >
                +
              </button>
            </div>

            {/* Main Add Button */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-card ${
                addedSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-chocolate-900 hover:bg-chocolate-800 text-gold-400'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-gold-400" />
                  <span>Add to Cart • {formatRupees(currentPricePaise * quantity)}</span>
                </>
              )}
            </button>
          </div>

          {/* Delivery Eligibility Checker */}
          <div className="p-4 bg-white rounded-2xl border border-cream-200 space-y-3">
            <span className="text-xs font-bold text-chocolate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold-600" />
              Check Delivery Eligibility & Fee
            </span>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 400088)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="flex-1 px-3 py-2 text-sm bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={checkingPincode}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-chocolate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                {checkingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeCheckResult && (
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed ${
                  pincodeCheckResult.isDeliverable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {pincodeCheckResult.message}
                {pincodeCheckResult.isDeliverable && (
                  <div className="mt-1 font-semibold">
                    Delivery Fee: {formatRupees(pincodeCheckResult.deliveryFee)} (Free on orders above{' '}
                    {formatRupees(pincodeCheckResult.freeDeliveryThreshold)})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ingredients & Allergens Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-cream-200">
        <div className="bg-white p-6 rounded-2xl border border-cream-200 space-y-3">
          <h4 className="font-serif font-bold text-lg text-chocolate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-gold-600" />
            Key Ingredients
          </h4>
          <p className="text-xs text-chocolate-600">
            We use only the finest natural ingredients with zero artificial stabilizers or premixes:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {product.ingredients?.map((ing, idx) => (
              <span
                key={idx}
                className="text-xs bg-cream-100 text-chocolate-800 px-3 py-1 rounded-full font-medium"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream-200 space-y-3">
          <h4 className="font-serif font-bold text-lg text-chocolate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Allergen Information
          </h4>
          <p className="text-xs text-chocolate-600">
            Please review allergen warnings before placing your order:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {product.allergens?.map((alg, idx) => (
              <span
                key={idx}
                className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-semibold"
              >
                {alg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-8 border-t border-cream-200 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-chocolate-950">
              Approved Customer Reviews
            </h3>
            <p className="text-xs text-chocolate-600 mt-1">
              Verified feedback from genuine customer deliveries
            </p>
          </div>

          <a
            href="#write-review"
            className="px-4 py-2 rounded-xl bg-cream-100 border border-cream-300 text-chocolate-800 text-xs font-bold hover:bg-cream-200"
          >
            Leave a Review
          </a>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-chocolate-600 italic bg-white p-6 rounded-2xl border border-cream-200 text-center">
            No approved reviews for this cake yet. Be the first to share your celebration experience!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Customer
                  </span>
                </div>
                <p className="text-sm text-chocolate-800 leading-relaxed italic">
                  "{r.comment}"
                </p>
                <div className="text-xs font-bold text-chocolate-900">{r.customerName}</div>
              </div>
            ))}
          </div>
        )}

        {/* Leave Review Form */}
        <div id="write-review" className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 max-w-xl mx-auto space-y-4">
          <h4 className="font-serif font-bold text-lg text-chocolate-950">
            Share Your Experience
          </h4>
          <p className="text-xs text-chocolate-600">
            Every review is moderated by our team to maintain 100% genuine feedback for the bakery.
          </p>

          {reviewSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium">
              {reviewSuccessMsg}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-chocolate-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="e.g. Sanjeev Kapoor"
                className="w-full px-3 py-2 text-sm bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-700 mb-1">Star Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Outstanding</option>
                <option value={4}>⭐⭐⭐⭐ (4/5) - Great</option>
                <option value={3}>⭐⭐⭐ (3/5) - Average</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-700 mb-1">Review & Taste</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us about the texture, flavour and packaging..."
                className="w-full px-3 py-2 text-sm bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full py-3 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review for Verification'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
