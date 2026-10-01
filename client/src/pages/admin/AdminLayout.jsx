import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cake,
  Package,
  Sparkles,
  Settings,
  Tag,
  Star,
  FileSpreadsheet,
  LogOut,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-chocolate-950">Access Restricted</h2>
        <p className="text-xs text-chocolate-600">
          Administrator privileges are required to view the bakery management console.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs"
        >
          Sign in as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard & Metrics', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Order Management', icon: Package },
    { to: '/admin/custom-quotes', label: 'Custom Cake Quotes', icon: Sparkles },
    { to: '/admin/products', label: 'Products & Variants', icon: Cake },
    { to: '/admin/settings', label: 'Bakery & Delivery Settings', icon: Settings },
    { to: '/admin/coupons', label: 'Promotions & Coupons', icon: Tag },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-chocolate-950 text-cream-100 flex flex-col justify-between shrink-0 p-5 border-r border-chocolate-900">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-chocolate-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-chocolate-950 font-serif font-bold flex items-center justify-center text-sm">
                R
              </div>
              <span className="font-serif font-bold text-base text-white">Bakery Console</span>
            </Link>
            <Link
              to="/"
              className="text-xs text-gold-400 hover:text-white flex items-center gap-1"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Store
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gold-500 text-chocolate-950 shadow-sm'
                        : 'text-chocolate-300 hover:bg-chocolate-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-chocolate-800 space-y-3 text-xs">
          <div className="text-chocolate-400">
            Logged in as <strong className="text-white block truncate">{user.email}</strong>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
