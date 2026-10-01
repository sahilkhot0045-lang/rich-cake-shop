import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle, Percent } from 'lucide-react';
import api from '../../api/axios';
import { formatRupees, formatDate } from '../../utils/formatters';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValueRupees: 500,
    maxDiscountAmountRupees: 250,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.warn('Error loading coupons:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue:
          formData.discountType === 'percentage'
            ? Number(formData.discountValue)
            : Math.round(Number(formData.discountValue) * 100), // paise if fixed
        minOrderValue: Math.round(Number(formData.minOrderValueRupees) * 100), // paise
        maxDiscountAmount: Math.round(Number(formData.maxDiscountAmountRupees) * 100), // paise
        validUntil: formData.validUntil,
      };

      await api.post('/admin/coupons', payload);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Promotions & Discounts
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
            Coupon Codes ({coupons.length})
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider hover:bg-chocolate-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-chocolate-500 animate-pulse">
            Loading coupon codes...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-chocolate-600">No active coupons.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Type & Discount</th>
                  <th className="p-3.5">Min Order Value</th>
                  <th className="p-3.5">Max Discount</th>
                  <th className="p-3.5">Expires</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-cream-50/70">
                    <td className="p-3.5 font-bold font-mono text-chocolate-950 text-sm">
                      {c.code}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-700">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% OFF`
                          : `${formatRupees(c.discountValue)} FLAT OFF`}
                      </span>
                      <span className="text-[11px] text-chocolate-500 block">{c.description}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-chocolate-800">
                      {formatRupees(c.minOrderValue)}
                    </td>
                    <td className="p-3.5 font-semibold text-chocolate-800">
                      {c.maxDiscountAmount > 0 ? formatRupees(c.maxDiscountAmount) : 'Unlimited'}
                    </td>
                    <td className="p-3.5 text-chocolate-600">{formatDate(c.validUntil)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-chocolate-400 hover:text-red-500 p-1"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-chocolate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs">
            <h3 className="font-serif font-bold text-lg text-chocolate-950">
              Create Promotional Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off for Ganesh Chaturthi celebrations"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValueRupees}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValueRupees: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmountRupees}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmountRupees: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Valid Until *</label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-cream-300 rounded-xl font-bold text-chocolate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chocolate-900 text-gold-400 font-bold rounded-xl"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
