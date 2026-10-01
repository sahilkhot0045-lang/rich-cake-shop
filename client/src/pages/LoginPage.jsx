import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-gold p-0.5 mx-auto flex items-center justify-center shadow-gold">
            <div className="w-full h-full bg-chocolate-900 rounded-full flex items-center justify-center text-gold-400 font-serif font-bold text-xl">
              R
            </div>
          </div>
          <h1 className="font-serif font-extrabold text-2xl text-chocolate-950">
            Welcome to Rich Cake Shop
          </h1>
          <p className="text-xs text-chocolate-600">
            Sign in to track orders, manage custom cake quotes & saved addresses
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-chocolate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 text-sm"
              />
              <Mail className="w-4 h-4 text-chocolate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-chocolate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 text-sm"
              />
              <Lock className="w-4 h-4 text-chocolate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition shadow-card flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo credentials note */}
        <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 text-[11px] text-chocolate-700 space-y-1">
          <span className="font-bold block text-chocolate-900">Seeded Credentials:</span>
          <div>Admin: <code>admin@richcakeshop.com</code> / <code>RichCake@Admin2026</code></div>
          <div>Customer: <code>priya.sharma@example.com</code> / <code>Customer@2026</code></div>
        </div>

        <div className="text-center text-xs text-chocolate-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-gold-700 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
