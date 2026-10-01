import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      navigate('/account');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif font-extrabold text-2xl text-chocolate-950">
            Create Your Account
          </h1>
          <p className="text-xs text-chocolate-600">
            Join Rich Cake Shop to save favourite cakes & manage celebration orders
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
            <label className="block font-bold text-chocolate-700 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Deshmukh"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 text-sm"
              />
              <User className="w-4 h-4 text-chocolate-400 absolute left-3 top-3" />
            </div>
          </div>

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
            <label className="block font-bold text-chocolate-700 mb-1">Mobile Phone (WhatsApp)</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9820098200"
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 text-sm"
              />
              <Phone className="w-4 h-4 text-chocolate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-chocolate-700 mb-1">Create Password (Min. 6 chars)</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
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
            {loading ? 'Creating Account...' : 'Register Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-chocolate-600">
          Already registered?{' '}
          <Link to="/login" className="text-gold-700 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
