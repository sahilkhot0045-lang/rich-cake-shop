import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  ShieldCheck,
  CheckCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const Footer = () => {
  const { settings } = useStoreSettings();

  const shopAddress = settings?.address;
  const fullAddress = shopAddress
    ? `${shopAddress.shopNo}, ${shopAddress.street}, ${shopAddress.locality}, ${shopAddress.city} - ${shopAddress.pincode}`
    : 'Shop 4 & 5, Crystal Heights, Station Road, Mankhurd West, Mumbai - 400088';

  return (
    <footer className="bg-chocolate-900 text-cream-200 pt-16 pb-8 border-t border-chocolate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-chocolate-800 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-chocolate-800 flex items-center justify-center text-gold-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">Belgian Chocolate</h4>
            <p className="text-xs text-chocolate-300 mt-1">Pure cocoa & authentic artisanal recipes</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-chocolate-800 flex items-center justify-center text-gold-400 mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">100% Eggless Option</h4>
            <p className="text-xs text-chocolate-300 mt-1">Available for every single cake flavour</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-chocolate-800 flex items-center justify-center text-gold-400 mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">Chilled Delivery</h4>
            <p className="text-xs text-chocolate-300 mt-1">Temperature-controlled cake carriers</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-chocolate-800 flex items-center justify-center text-gold-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-white text-base">Verified Hygiene</h4>
            <p className="text-xs text-chocolate-300 mt-1">Daily sanitized baking facility</p>
          </div>
        </div>

        {/* 4-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-chocolate-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-gold p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-chocolate-900 rounded-full flex items-center justify-center text-gold-400 font-serif font-bold text-lg">
                  R
                </div>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Rich Cake Shop
              </span>
            </div>

            <p className="text-sm text-chocolate-300 leading-relaxed pr-6">
              {settings?.tagline ||
                'Artisanal handcrafted celebration cakes, ready-made gourmet bakes, and bespoke multi-tiered wedding confections prepared fresh in Mumbai.'}
            </p>

            <div className="pt-2 text-xs text-gold-400/90 font-medium">
              Registered Bakery & Commercial Confectionery • Mumbai, Maharashtra
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-serif text-white font-bold text-base mb-4 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-chocolate-300">
              <li>
                <Link to="/shop" className="hover:text-gold-400 transition">
                  Cakes Catalogue
                </Link>
              </li>
              <li>
                <Link to="/custom-cake" className="hover:text-gold-400 transition flex items-center gap-1.5 text-gold-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Custom Cake Studio
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-gold-400 transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition">
                  Our Story & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold-400 transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition">
                  Contact Bakery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Policies */}
          <div>
            <h4 className="font-serif text-white font-bold text-base mb-4 tracking-wide">
              Policies & Care
            </h4>
            <ul className="space-y-2.5 text-sm text-chocolate-300">
              <li>
                <Link to="/policies/delivery" className="hover:text-gold-400 transition">
                  Delivery Coverage & PINs
                </Link>
              </li>
              <li>
                <Link to="/policies/refunds" className="hover:text-gold-400 transition">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-gold-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-gold-400 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Contact (Admin Editable) */}
          <div>
            <h4 className="font-serif text-white font-bold text-base mb-4 tracking-wide">
              Bakery Store
            </h4>
            <div className="space-y-3 text-xs text-chocolate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{fullAddress}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`tel:${settings?.phone || '+919820098200'}`}
                  className="hover:text-gold-400 transition font-medium"
                >
                  {settings?.phone || '+91 98200 98200'}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'orders@richcakeshop.com'}`}
                  className="hover:text-gold-400 transition"
                >
                  {settings?.email || 'orders@richcakeshop.com'}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>
                  {settings?.businessHours?.openingTime || '09:00'} -{' '}
                  {settings?.businessHours?.closingTime || '22:00'} (All 7 Days)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-chocolate-400">
          <p>© {new Date().getFullYear()} Rich Cake Shop. All rights reserved.</p>
          <div className="flex items-center gap-3 text-chocolate-300">
            <span>Secured by Razorpay</span>
            <span>•</span>
            <span>UPI / Cards / NetBanking / COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
