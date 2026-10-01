import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Clock, ShieldCheck, CheckCircle, Save } from 'lucide-react';
import api from '../../api/axios';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { formatRupees } from '../../utils/formatters';

const AdminSettingsPage = () => {
  const { settings, refreshSettings } = useStoreSettings();

  const [formData, setFormData] = useState({
    storeName: '',
    tagline: '',
    phone: '',
    email: '',
    address: {
      shopNo: '',
      street: '',
      locality: '',
      city: '',
      state: '',
      pincode: '',
    },
    businessHours: {
      openingTime: '09:00',
      closingTime: '22:00',
    },
    orderCutoffLeadHours: 4,
    policies: {
      deliveryPolicy: '',
      cancellationRefundPolicy: '',
      privacyPolicy: '',
      termsAndConditions: '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || 'Rich Cake Shop',
        tagline: settings.tagline || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: {
          shopNo: settings.address?.shopNo || '',
          street: settings.address?.street || '',
          locality: settings.address?.locality || '',
          city: settings.address?.city || 'Mumbai',
          state: settings.address?.state || 'Maharashtra',
          pincode: settings.address?.pincode || '400088',
        },
        businessHours: {
          openingTime: settings.businessHours?.openingTime || '09:00',
          closingTime: settings.businessHours?.closingTime || '22:00',
        },
        orderCutoffLeadHours: settings.orderCutoffLeadHours || 4,
        policies: {
          deliveryPolicy: settings.policies?.deliveryPolicy || '',
          cancellationRefundPolicy: settings.policies?.cancellationRefundPolicy || '',
          privacyPolicy: settings.policies?.privacyPolicy || '',
          termsAndConditions: settings.policies?.termsAndConditions || '',
        },
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      const res = await api.put('/admin/store-settings', formData);
      if (res.data.success) {
        setSuccessMsg('Store settings and policies successfully updated!');
        refreshSettings();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
          Editable Configuration
        </span>
        <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
          Bakery & Delivery Settings
        </h1>
        <p className="text-xs text-chocolate-600 mt-1">
          Modify contact details, bakery address in Mankhurd, Mumbai, operating hours, and customer policies.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Section 1: Business Identity & Contact */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100">
            1. Bakery Brand & Direct Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Phone Number / WhatsApp *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Official Orders Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Physical Bakery Address (Mankhurd, Mumbai) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold-600" />
            2. Physical Bakery Location (For Pickup & Map)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Shop / Unit No *</label>
              <input
                type="text"
                required
                value={formData.address.shopNo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, shopNo: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Street / Landmark *</label>
              <input
                type="text"
                required
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Locality *</label>
              <input
                type="text"
                required
                value={formData.address.locality}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, locality: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-chocolate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.address.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operating Hours */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-600" />
            3. Kitchen Operating Hours & Cutoff Lead
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Opening Time *</label>
              <input
                type="text"
                required
                value={formData.businessHours.openingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessHours: { ...formData.businessHours, openingTime: e.target.value },
                  })
                }
                placeholder="09:00"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Closing Time *</label>
              <input
                type="text"
                required
                value={formData.businessHours.closingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessHours: { ...formData.businessHours, closingTime: e.target.value },
                  })
                }
                placeholder="22:00"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">
                Same-Day Cutoff Lead (Hours) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.orderCutoffLeadHours}
                onChange={(e) =>
                  setFormData({ ...formData, orderCutoffLeadHours: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Customer Policies */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-chocolate-950 pb-3 border-b border-cream-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-600" />
            4. Customer Policies (Displayed on Policy Pages)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-chocolate-700 mb-1">
                Delivery Coverage & Chilled Transit Policy
              </label>
              <textarea
                rows={3}
                value={formData.policies.deliveryPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, deliveryPolicy: e.target.value },
                  })
                }
                className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">
                Cancellation & Refund Policy (24-Hour Notice)
              </label>
              <textarea
                rows={3}
                value={formData.policies.cancellationRefundPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, cancellationRefundPolicy: e.target.value },
                  })
                }
                className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Privacy Policy</label>
              <textarea
                rows={2}
                value={formData.policies.privacyPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, privacyPolicy: e.target.value },
                  })
                }
                className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-chocolate-700 mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={formData.policies.termsAndConditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, termsAndConditions: e.target.value },
                  })
                }
                className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition shadow-card disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>{saving ? 'Saving Changes...' : 'Save All Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
