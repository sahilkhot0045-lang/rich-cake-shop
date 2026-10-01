import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const ContactPage = () => {
  const { settings } = useStoreSettings();
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const shopAddress = settings?.address;
  const fullAddress = shopAddress
    ? `${shopAddress.shopNo}, ${shopAddress.street}, ${shopAddress.locality}, ${shopAddress.city} - ${shopAddress.pincode}`
    : 'Shop 4 & 5, Crystal Heights, Station Road, Near Mankhurd Railway Station, Mankhurd West, Mumbai - 400088';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
          Bakery & Studio Desk
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-chocolate-950">
          Contact Rich Cake Shop
        </h1>
        <p className="text-sm text-chocolate-700">
          Have an inquiry regarding cake sizing, delivery PIN code coverage, or corporate bulk gifting? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Contact Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
            <h3 className="font-serif font-bold text-xl text-chocolate-950 pb-3 border-b border-cream-100">
              Bakery Store Information
            </h3>

            <div className="space-y-4 text-xs text-chocolate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-chocolate-900 block">Flagship Bakery Location</span>
                  <p className="mt-0.5 leading-relaxed">{fullAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-chocolate-900 block">Telephone & WhatsApp</span>
                  <a
                    href={`tel:${settings?.phone || '+919820098200'}`}
                    className="hover:text-gold-700 font-semibold"
                  >
                    {settings?.phone || '+91 98200 98200'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-chocolate-900 block">Orders & Custom Quotes Email</span>
                  <a
                    href={`mailto:${settings?.email || 'orders@richcakeshop.com'}`}
                    className="hover:text-gold-700 font-semibold"
                  >
                    {settings?.email || 'orders@richcakeshop.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-chocolate-900 block">Bakery Kitchen Hours</span>
                  <p className="mt-0.5">
                    {settings?.businessHours?.openingTime || '09:00'} -{' '}
                    {settings?.businessHours?.closingTime || '22:00'} (Monday through Sunday)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft">
          <h3 className="font-serif font-bold text-xl text-chocolate-950 mb-2">
            Send an Inquiry
          </h3>
          <p className="text-xs text-chocolate-600 mb-6">
            Leave a message and our store manager will reply promptly.
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-fade-in">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-emerald-950 text-base">Message Delivered!</h4>
              <p className="text-xs text-emerald-800">
                Thank you, {formName}. We will respond to your inquiry via phone or email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Inquiry / Note *</label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Tell us what you need assistance with..."
                  className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition shadow-card flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4 text-gold-400" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
