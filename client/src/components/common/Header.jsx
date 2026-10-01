import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  LogOut,
  Settings,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { settings } = useStoreSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
      {/* Top Announcement Bar */}
      <div className="bg-chocolate-900 text-cream-100 text-xs py-2 px-4 border-b border-chocolate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-gold-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              100% Pure Artisanal Bakes
            </span>
            <span className="hidden md:inline text-chocolate-400">•</span>
            <span className="hidden md:flex items-center gap-1 text-cream-200">
              <Clock className="w-3 h-3 text-gold-400" />
              {settings?.businessHours?.openingTime || '09:00'} - {settings?.businessHours?.closingTime || '22:00'} Daily
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings?.phone || '+919820098200'}`}
              className="flex items-center gap-1 hover:text-gold-400 transition"
            >
              <Phone className="w-3 h-3 text-gold-400" />
              <span className="font-semibold">{settings?.phone || '+91 98200 98200'}</span>
            </a>
            <span className="text-chocolate-400">•</span>
            <span className="text-gold-300 font-medium hidden sm:inline">
              Mankhurd & Mumbai Fresh Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-chocolate-800 hover:bg-cream-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-gold p-0.5 shadow-gold flex items-center justify-center">
              <div className="w-full h-full bg-chocolate-900 rounded-full flex items-center justify-center text-gold-400 font-serif font-bold text-xl">
                R
              </div>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-chocolate-900 group-hover:text-gold-600 transition">
                Rich Cake Shop
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-chocolate-600 font-semibold">
                Artisanal Bakery • Mumbai
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xs xl:max-w-sm relative mx-4"
          >
            <input
              type="text"
              placeholder="Search chocolate, mango, cheesecakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-cream-100 border border-cream-300 rounded-full focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 placeholder-chocolate-400"
            />
            <Search className="w-4 h-4 text-chocolate-400 absolute left-3 top-2.5" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              to="/"
              className="text-sm font-semibold text-chocolate-800 hover:text-gold-600 transition tracking-wide"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-sm font-semibold text-chocolate-800 hover:text-gold-600 transition tracking-wide"
            >
              Cakes Catalogue
            </Link>
            <Link
              to="/custom-cake"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-700 bg-gold-50 px-3 py-1.5 rounded-full border border-gold-300 hover:bg-gold-500 hover:text-white transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Custom Cake Studio
            </Link>
            <Link
              to="/track"
              className="text-sm font-medium text-chocolate-700 hover:text-gold-600 transition"
            >
              Track Order
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-chocolate-700 hover:text-gold-600 transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-chocolate-700 hover:text-gold-600 transition"
            >
              Contact
            </Link>
          </nav>

          {/* User Account & Cart Buttons */}
          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-cream-100 border border-cream-200 text-chocolate-800 text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-blush-200 text-chocolate-900 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-cream-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-cream-100">
                      <p className="text-xs text-chocolate-600">Signed in as</p>
                      <p className="text-sm font-bold text-chocolate-900 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gold-700 hover:bg-gold-50"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-chocolate-700 hover:bg-cream-50"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Account & Addresses
                    </Link>

                    <Link
                      to="/account?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-chocolate-700 hover:bg-cream-50"
                    >
                      <Package className="w-4 h-4" />
                      My Orders & Quotes
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-cream-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-chocolate-800 hover:text-gold-600 px-3 py-1.5 rounded-lg transition"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-chocolate-900 text-gold-400 hover:bg-chocolate-800 hover:scale-105 transition shadow-sm flex items-center justify-center"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gold-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blush-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-200 bg-cream-50 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search cakes, flavours, cheesecakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
            />
            <Search className="w-4 h-4 text-chocolate-400 absolute left-3 top-2.5" />
          </form>

          <nav className="flex flex-col space-y-2 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-semibold text-chocolate-900 hover:bg-cream-100"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-semibold text-chocolate-900 hover:bg-cream-100"
            >
              Cakes Catalogue
            </Link>
            <Link
              to="/custom-cake"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-bold text-gold-700 bg-gold-50 border border-gold-200"
            >
              <Sparkles className="w-4 h-4" />
              Custom Cake Studio
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-chocolate-700 hover:bg-cream-100"
            >
              Track Order
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-chocolate-700 hover:bg-cream-100"
            >
              About Our Bakery
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-chocolate-700 hover:bg-cream-100"
            >
              Contact Us
            </Link>

            {!user && (
              <div className="pt-2 border-t border-cream-200">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2.5 rounded-lg bg-chocolate-900 text-gold-400 font-semibold text-sm"
                >
                  Sign In / Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
