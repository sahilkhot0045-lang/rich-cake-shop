import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Cake,
  Gift,
  Heart,
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/shop/ProductCard';
import { useStoreSettings } from '../context/StoreSettingsContext';

const HomePage = () => {
  const { settings } = useStoreSettings();
  const [featuredCakes, setFeaturedCakes] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [seasonalCakes, setSeasonalCakes] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, bestSellersRes, seasonalRes, testimonialsRes] = await Promise.all([
          api.get('/products?featured=true&limit=4'),
          api.get('/products?bestSeller=true&limit=4'),
          api.get('/products?seasonal=true&limit=3'),
          api.get('/reviews/testimonials/home'),
        ]);

        setFeaturedCakes(featuredRes.data.products || []);
        setBestSellers(bestSellersRes.data.products || []);
        setSeasonalCakes(seasonalRes.data.products || []);
        setTestimonials(testimonialsRes.data.testimonials || []);
      } catch (err) {
        console.warn('Failed to load home page products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const hero = settings?.heroBanner || {
    badgeText: 'Artisanal Mumbai Bakery • 100% Fresh Daily',
    title: 'Handcrafted Elegance for Life’s Sweetest Moments',
    subtitle:
      'From decadent Belgian chocolates and Mumbai mango gateaux to multi-tiered bespoke celebration cakes. Baked fresh in Mankhurd, Mumbai with pure dairy cream and zero artificial stabilizers.',
    ctaPrimaryText: 'Explore Ready-Made Cakes',
    ctaSecondaryText: 'Custom Cake Studio',
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-cream-50 to-white pt-10 pb-16 sm:py-20 border-b border-cream-200">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blush-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-gold-800 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>{hero.badgeText}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-chocolate-950 tracking-tight leading-[1.15]">
                {hero.title}
              </h1>

              <p className="text-base sm:text-lg text-chocolate-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-base hover:bg-chocolate-800 hover:scale-[1.02] active:scale-[0.98] transition shadow-card flex items-center justify-center gap-2"
                >
                  <span>{hero.ctaPrimaryText}</span>
                  <ArrowRight className="w-5 h-5 text-gold-400" />
                </Link>

                <Link
                  to="/custom-cake"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border-2 border-gold-400 text-chocolate-900 font-bold text-base hover:bg-gold-50 transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-gold-600" />
                  <span>{hero.ctaSecondaryText}</span>
                </Link>
              </div>

              {/* Delivery coverage pill */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-chocolate-600 font-medium">
                <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                <span>
                  Delivery across Mankhurd, Chembur, Govandi, Ghatkopar, Sion & Navi Mumbai
                </span>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-cream-200 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"
                    alt="Royal Belgian Dark Chocolate Truffle Cake"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">
                      Chef's Signature
                    </span>
                    <h3 className="font-serif text-2xl font-bold">Belgian Dark Truffle</h3>
                    <p className="text-xs text-cream-200 mt-1">70% Callebaut Dark Ganache with 24k Gold Leaf</p>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-cream-200 shadow-card flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 font-bold">
                    <Star className="w-6 h-6 fill-gold-500 text-gold-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-chocolate-900">4.9 / 5.0 Star Rating</div>
                    <div className="text-xs text-chocolate-600">Over 1,200+ Verified Celebrations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-3xl border border-cream-200 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-gold-600 shrink-0">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-chocolate-900 text-lg">Pure Artisanal Recipes</h4>
              <p className="text-sm text-chocolate-600 mt-1 leading-relaxed">
                Made from real Belgian chocolate, pure dairy butter and authentic vanilla beans. No premixes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blush-100 flex items-center justify-center text-blush-500 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-chocolate-900 text-lg">Bespoke Custom Cakes</h4>
              <p className="text-sm text-chocolate-600 mt-1 leading-relaxed">
                Multi-tier wedding centerpieces and personalized sculpted cakes designed to your exact theme.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-chocolate-900 text-lg">Slot-Guaranteed Delivery</h4>
              <p className="text-sm text-chocolate-600 mt-1 leading-relaxed">
                Choose your exact morning, afternoon, or evening celebration slot. Chilled carrier transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
              Most Loved Creations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-950 mt-1">
              Bakery Bestsellers
            </h2>
          </div>
          <Link
            to="/shop?bestSeller=true"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-chocolate-800 hover:text-gold-600 transition"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Seasonal Special Showcase (Mango Gateau / Fruit Specials) */}
      {seasonalCakes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cream-200 via-blush-100 to-cream-100 border border-gold-200 p-8 sm:p-12">
            <div className="max-w-xl space-y-4">
              <span className="bg-blush-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Limited Seasonal Harvest
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-950">
                Fresh Alphonso Mango Delicacy
              </h2>
              <p className="text-chocolate-800 text-sm sm:text-base leading-relaxed">
                Fresh GI-tagged Ratnagiri Alphonso mango slices combined with airy Madagascar vanilla chantilly cream and delicate sponge. Available only during harvest seasons.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop?seasonal=true"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-sm hover:bg-chocolate-800 transition"
                >
                  <span>Explore Seasonal Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Custom Cake Studio Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-chocolate-950 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-gold-500/30">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Artisanal Studio Service
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-cream-50 leading-tight">
              Design Your Dream Celebration Cake
            </h2>

            <p className="text-chocolate-200 text-sm sm:text-base leading-relaxed">
              Have a specific inspiration, multi-tier wedding theme, or sculpted design in mind? Submit your reference images and preferences. Our chef will evaluate feasibility and provide an official quotation with guaranteed delivery.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/custom-cake"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-gold text-chocolate-950 font-bold text-base hover:brightness-110 transition shadow-gold flex items-center justify-center gap-2"
              >
                <span>Launch Custom Cake Builder</span>
                <ArrowRight className="w-5 h-5 text-chocolate-950" />
              </Link>

              <span className="text-xs text-chocolate-400">
                Transparent indicative pricing • Zero obligation quote
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Genuine Approved Reviews / Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
              Verified Celebrations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-950 mt-1">
              Customer Love & Testimonials
            </h2>
            <p className="text-sm text-chocolate-600 mt-2">
              Only authentic, administrator-approved reviews from verified customer deliveries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-cream-200 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-gold-500 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <p className="text-chocolate-800 text-sm italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-cream-100 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-chocolate-900">{t.customerName}</h5>
                    {t.flavourMentioned && (
                      <p className="text-chocolate-500 text-[11px]">{t.flavourMentioned}</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Order
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Shop Location & Coverage Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-100 rounded-3xl p-8 sm:p-10 border border-cream-300 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-chocolate-600">
              Visit or Order Online
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-chocolate-950 mt-1">
              Bakery in Mankhurd West, Mumbai
            </h3>
            <p className="text-sm text-chocolate-700 mt-3 leading-relaxed">
              Order online for prompt temperature-controlled doorstep delivery or choose <strong>Pick-up from Bakery</strong> to collect freshly baked celebration cakes directly from our ovens.
            </p>

            <div className="mt-5 space-y-2 text-xs text-chocolate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-600" />
                <span>
                  {settings?.address?.shopNo}, {settings?.address?.street}, {settings?.address?.locality}, Mumbai - {settings?.address?.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-600" />
                <span>Operating Hours: 09:00 AM - 10:00 PM (Monday through Sunday)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-sm text-center hover:bg-chocolate-800 transition"
            >
              Order for Delivery
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-chocolate-300 text-chocolate-900 font-bold text-sm text-center hover:bg-cream-50 transition"
            >
              Bakery Directions & Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
