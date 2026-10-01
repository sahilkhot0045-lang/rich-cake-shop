import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.warn('Error fetching reviews:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id, isApprovedByAdmin, isFeaturedOnHome) => {
    try {
      await api.put(`/admin/reviews/${id}/moderate`, {
        isApprovedByAdmin,
        isFeaturedOnHome,
      });
      fetchReviews();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
          Trust & Authenticity
        </span>
        <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
          Customer Reviews Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-chocolate-600 mt-1">
          Strict policy: Only genuine customer reviews with verified purchase deliveries are approved.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-chocolate-500 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-chocolate-600">
            No customer reviews pending moderation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Cake Product</th>
                  <th className="p-3.5">Rating & Feedback</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Featured on Home</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-cream-50/70">
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-chocolate-950 block">{r.customerName}</span>
                      <span className="text-[11px] text-chocolate-500">{formatDate(r.createdAt)}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-chocolate-900 block truncate max-w-[160px]">
                        {r.product?.title || 'General Bakery Review'}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <div className="flex items-center gap-1 text-gold-500 mb-1">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                        ))}
                      </div>
                      <p className="text-chocolate-800 italic">"{r.comment}"</p>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          r.isApprovedByAdmin
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.isApprovedByAdmin ? 'Approved' : 'Pending Moderation'}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleModerate(r._id, r.isApprovedByAdmin, !r.isFeaturedOnHome)
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                          r.isFeaturedOnHome
                            ? 'border-gold-500 bg-gold-100 text-gold-900'
                            : 'border-cream-300 text-chocolate-500 hover:border-chocolate-500'
                        }`}
                      >
                        {r.isFeaturedOnHome ? 'Featured on Home ★' : 'Feature on Home'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      {!r.isApprovedByAdmin ? (
                        <button
                          onClick={() => handleModerate(r._id, true, r.isFeaturedOnHome)}
                          className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800"
                        >
                          Approve Review
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerate(r._id, false, false)}
                          className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200"
                        >
                          Revoke Approval
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
