import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  Upload,
  Info,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Heart,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { calculateEstimatedCustomPrice, formatRupees } from '../utils/formatters';

const OCCASIONS = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Baby Shower',
  'Farewell',
  'Corporate',
  'Other',
];

const SHAPES = ['Round', 'Square', 'Heart', 'Multi-Tier', 'Custom Sculpted'];

const FLAVOURS = [
  'Belgian Dark Chocolate Ganache',
  'Dutch Truffle & Hazelnut Crunch',
  'Alphonso Mango Cream Gateau',
  'Red Velvet Cream Cheese',
  'New York Baked Cheesecake Tier',
  'Persian Rose & Pistachio',
  'Classic Vanilla Buttercream',
];

const CustomCakePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [occasion, setOccasion] = useState('Birthday');
  const [shape, setShape] = useState('Round');
  const [tiers, setTiers] = useState(1);
  const [weightKg, setWeightKg] = useState(1.5);
  const [flavour, setFlavour] = useState(FLAVOURS[0]);
  const [colourTheme, setColourTheme] = useState('Pastel Blush & Cream with Gold Leaf');
  const [eggless, setEggless] = useState(true);
  const [inscription, setInscription] = useState('');
  const [dietaryRequests, setDietaryRequests] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [detailedInstructions, setDetailedInstructions] = useState('');

  const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]; // Minimum 48h lead for custom cakes
  const [preferredDate, setPreferredDate] = useState(minDate);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (10:00 AM - 1:00 PM)');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successRequest, setSuccessRequest] = useState(null);

  // Dynamic indicative estimate
  const estimate = calculateEstimatedCustomPrice({
    weightGram: Math.round(weightKg * 1000),
    tiers,
    shape,
  });

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (referenceImageUrl.trim()) {
      setReferenceImages([...referenceImages, referenceImageUrl.trim()]);
      setReferenceImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerPhone || customerPhone.length < 10) {
      setErrorMsg('Please provide a valid 10-digit phone number for chef consultation.');
      return;
    }

    if (!detailedInstructions || detailedInstructions.length < 10) {
      setErrorMsg('Please describe your desired design, theme, or decorations in detail.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        occasion,
        preferredDate,
        preferredTimeSlot,
        flavour,
        weightGram: Math.round(weightKg * 1000),
        shape,
        tiers,
        colourTheme,
        eggless,
        inscription,
        dietaryRequests,
        estimatedBudget: estimate.minPaise,
        detailedInstructions,
        referenceImages,
      };

      const res = await api.post('/custom-cakes', payload);
      if (res.data.success) {
        setSuccessRequest(res.data.request);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-extrabold text-chocolate-950">
          Custom Cake Request Received!
        </h2>
        <p className="text-sm text-chocolate-700 leading-relaxed max-w-lg mx-auto">
          Thank you, <strong>{customerName}</strong>. Our executive pastry chef will examine your design specifications for <strong>{occasion}</strong>, verify ingredient availability and time slots, and issue an official quotation with guaranteed delivery within 24 hours.
        </p>

        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 text-xs text-chocolate-800 text-left space-y-1">
          <div>
            <strong>Reference ID: </strong> {successRequest._id}
          </div>
          <div>
            <strong>Celebration Date: </strong>{' '}
            {new Date(successRequest.preferredDate).toLocaleDateString('en-IN')}
          </div>
          <div>
            <strong>Estimated Baseline: </strong> {estimate.formattedRange} (Official quote will be sent to your email & account)
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/account?tab=quotes"
            className="px-6 py-3 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-sm shadow-card"
          >
            View My Requests & Quotes
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 rounded-xl bg-white border border-cream-300 text-chocolate-800 font-semibold text-sm"
          >
            Explore Ready-Made Cakes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Title & Banner */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Bespoke Cake Studio
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-chocolate-950">
          Custom Celebration Cake Designer
        </h1>
        <p className="text-sm sm:text-base text-chocolate-700 mt-2 leading-relaxed">
          From multi-tiered floral wedding centerpieces to personalized themed birthday sculpted cakes. Specify your dream aesthetic below to receive an official chef quotation.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Interactive Form (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Occasion & Shape */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-5">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 flex items-center gap-2 pb-3 border-b border-cream-100">
              <span className="w-6 h-6 rounded-full bg-chocolate-900 text-gold-400 text-xs flex items-center justify-center font-sans">
                1
              </span>
              Occasion & Cake Structure
            </h3>

            {/* Occasion */}
            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                Celebration Occasion
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setOccasion(occ)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      occasion === occ
                        ? 'bg-chocolate-900 text-gold-400 border-chocolate-900 shadow-sm'
                        : 'bg-cream-50 text-chocolate-700 border-cream-300 hover:border-chocolate-500'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape & Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                  Cake Shape
                </label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-sm font-semibold text-chocolate-900 focus:outline-none focus:border-gold-500"
                >
                  {SHAPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                  Number of Tiers
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTiers(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${
                        tiers === t
                          ? 'bg-gold-500 text-chocolate-950 border-gold-600 shadow-sm'
                          : 'bg-cream-50 text-chocolate-700 border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {t} {t === 1 ? 'Tier' : 'Tiers'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-chocolate-700 uppercase tracking-wider">
                  Target Weight: <span className="text-gold-700 text-sm font-extrabold">{weightKg} kg</span>
                </span>
                <span className="text-chocolate-500">
                  Approx. serves {Math.round(weightKg * 8)} - {Math.round(weightKg * 10)} guests
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full accent-gold-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-chocolate-400 mt-1 font-semibold">
                <span>1.0 kg (Serves 8-10)</span>
                <span>2.5 kg (Serves 20-25)</span>
                <span>5.0 kg (Serves 40-50)</span>
              </div>
            </div>
          </div>

          {/* Step 2: Flavour & Dietary */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-5">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 flex items-center gap-2 pb-3 border-b border-cream-100">
              <span className="w-6 h-6 rounded-full bg-chocolate-900 text-gold-400 text-xs flex items-center justify-center font-sans">
                2
              </span>
              Flavour Palette & Dietary Guidelines
            </h3>

            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                Gourmet Sponge & Filling
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FLAVOURS.map((flv) => (
                  <button
                    key={flv}
                    type="button"
                    onClick={() => setFlavour(flv)}
                    className={`p-3 rounded-xl text-left text-xs font-bold border transition ${
                      flavour === flv
                        ? 'border-chocolate-900 bg-chocolate-900 text-gold-400 shadow-sm'
                        : 'border-cream-300 bg-cream-50 text-chocolate-800 hover:bg-cream-100'
                    }`}
                  >
                    {flv}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eggless}
                  onChange={(e) => setEggless(e.target.checked)}
                  className="w-5 h-5 rounded text-gold-600 focus:ring-gold-500"
                />
                <div>
                  <span className="font-bold text-xs text-chocolate-900">
                    100% Eggless Preparation Required
                  </span>
                  <span className="text-[11px] text-chocolate-600 block">
                    Zero eggs used, prepared with pure dairy buttermilk and premium plant starches
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-1">
                Specific Dietary Allergens / Requirements
              </label>
              <input
                type="text"
                placeholder="e.g. Nut-Free, Gluten-Free, Less Sugar, No Gelatin"
                value={dietaryRequests}
                onChange={(e) => setDietaryRequests(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Step 3: Aesthetic Styling & References */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-5">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 flex items-center gap-2 pb-3 border-b border-cream-100">
              <span className="w-6 h-6 rounded-full bg-chocolate-900 text-gold-400 text-xs flex items-center justify-center font-sans">
                3
              </span>
              Styling, Colour Theme & Reference Photos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-1">
                  Colour Theme / Palette
                </label>
                <input
                  type="text"
                  value={colourTheme}
                  onChange={(e) => setColourTheme(e.target.value)}
                  placeholder="e.g. Dusty Rose & Ivory with Rose Gold"
                  className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-1">
                  Name / Message on Cake
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={inscription}
                  onChange={(e) => setInscription(e.target.value)}
                  placeholder="e.g. Happy 1st Anniversary Priya & Rohan"
                  className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Reference Images URL Input */}
            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-1">
                Reference Image Links (Pinterest / Instagram / Cloud URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-cream-200 text-chocolate-900 font-bold text-xs rounded-xl hover:bg-cream-300"
                >
                  Add Link
                </button>
              </div>

              {/* Added image previews */}
              {referenceImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3">
                  {referenceImages.map((url, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-cream-300">
                      <img src={url} alt="Reference" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-red-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-1">
                Detailed Design & Styling Instructions *
              </label>
              <textarea
                required
                rows={4}
                value={detailedInstructions}
                onChange={(e) => setDetailedInstructions(e.target.value)}
                placeholder="Describe floral elements, figurines, textures (stucco, mirror glaze, fondant drape), acrylic cake toppers or specific delivery coordination..."
                className="w-full p-3 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Step 4: Celebration Date & Contact Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-950 flex items-center gap-2 pb-3 border-b border-cream-100">
              <span className="w-6 h-6 rounded-full bg-chocolate-900 text-gold-400 text-xs flex items-center justify-center font-sans">
                4
              </span>
              Celebration Date & Client Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">
                  Preferred Delivery Date * (Min. 48h lead)
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">
                  Preferred Slot Window
                </label>
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none font-semibold"
                >
                  <option>Morning (10:00 AM - 1:00 PM)</option>
                  <option>Afternoon (1:00 PM - 5:00 PM)</option>
                  <option>Evening Celebration (5:00 PM - 9:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Anjali Nair"
                  className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-700 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="For chef design consultation"
                  className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-chocolate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="To receive binding quote & approval invoice"
                  className="w-full px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Indicative Price Estimator & Submission (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-300 shadow-soft space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-cream-100">
              <Sparkles className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-lg text-chocolate-950">
                Indicative Estimate
              </h3>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-chocolate-500 uppercase tracking-wider font-semibold">
                Estimated Price Range
              </div>
              <div className="font-serif font-extrabold text-3xl text-chocolate-950">
                {estimate.formattedRange}
              </div>
              <p className="text-[11px] text-chocolate-600">
                Baseline calculation for {weightKg} kg, {tiers} tier ({shape} shape).
              </p>
            </div>

            {/* Feasibility Disclaimer */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Transparent Quote Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This is an indicative estimate. Our master chef individually evaluates structural feasibility, prep hours, and intricate hand-crafting before issuing your final approved quotation.
              </p>
            </div>

            <div className="space-y-2 text-xs text-chocolate-700">
              <div className="flex justify-between">
                <span>Occasion:</span>
                <span className="font-bold text-chocolate-900">{occasion}</span>
              </div>
              <div className="flex justify-between">
                <span>Flavour:</span>
                <span className="font-bold text-chocolate-900 truncate max-w-[160px]">{flavour}</span>
              </div>
              <div className="flex justify-between">
                <span>Dietary:</span>
                <span className="font-bold text-chocolate-900">{eggless ? '100% Eggless' : 'Standard'}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-sm uppercase tracking-wider hover:bg-chocolate-800 transition shadow-card flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting to Chef...</span>
              ) : (
                <>
                  <span>Request Official Quotation</span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </>
              )}
            </button>

            <div className="text-[11px] text-chocolate-500 text-center leading-relaxed">
              No immediate payment required. You will review the final binding quote before paying the deposit.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomCakePage;
