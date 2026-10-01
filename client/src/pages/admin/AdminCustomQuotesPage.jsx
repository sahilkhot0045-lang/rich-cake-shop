import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';
import api from '../../api/axios';
import { formatRupees, formatDate } from '../../utils/formatters';

const AdminCustomQuotesPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  // Quote form state
  const [quotePriceRupees, setQuotePriceRupees] = useState('');
  const [depositRupees, setDepositRupees] = useState('');
  const [prepTimeHours, setPrepTimeHours] = useState(48);
  const defaultValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [adminNotes, setAdminNotes] = useState('');

  // Messaging thread state
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/custom-quotes');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.warn('Error fetching custom quotes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleIssueQuote = async (e) => {
    e.preventDefault();
    if (!selectedReq || !quotePriceRupees) return;

    try {
      setSubmittingQuote(true);
      const res = await api.post(`/admin/custom-quotes/${selectedReq._id}/quote`, {
        quotedPrice: Math.round(Number(quotePriceRupees) * 100), // paise
        depositRequired: Math.round(Number(depositRupees || quotePriceRupees / 2) * 100), // paise
        preparationTimeHours: Number(prepTimeHours),
        validUntil,
        adminNotes,
      });

      if (res.data.success) {
        alert('Official quote sent to customer!');
        setRequests(requests.map((r) => (r._id === selectedReq._id ? res.data.request : r)));
        setSelectedReq(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to issue quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSendAdminNote = async (reqId) => {
    if (!replyMessage.trim()) return;
    try {
      const res = await api.post(`/custom-cakes/${reqId}/notes`, {
        message: replyMessage.trim(),
      });
      setRequests(requests.map((r) => (r._id === reqId ? res.data.request : r)));
      setReplyMessage('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
          Bespoke Studio Pipeline
        </span>
        <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
          Custom Cake Quote Requests ({requests.length})
        </h1>
        <p className="text-xs text-chocolate-600 mt-1">
          Review design feasibility, structural tiers, and issuance of binding customer quotations.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-chocolate-500 animate-pulse">
          Loading custom cake pipeline...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-cream-200 text-xs text-chocolate-600">
          No custom cake requests awaiting review.
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-cream-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-chocolate-950">
                      {req.occasion} • {req.weightGram / 1000} kg ({req.shape}, {req.tiers}{' '}
                      {req.tiers === 1 ? 'Tier' : 'Tiers'})
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        req.status === 'quoted'
                          ? 'bg-gold-100 text-gold-800'
                          : req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-cream-200 text-chocolate-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs text-chocolate-600 mt-0.5">
                    Customer: <strong>{req.customerName}</strong> ({req.customerPhone} • {req.customerEmail})
                  </div>
                </div>

                <div className="text-xs sm:text-right">
                  <div className="font-bold text-chocolate-900">
                    Preferred Date: {formatDate(req.preferredDate)}
                  </div>
                  <span className="text-[11px] text-chocolate-500">{req.preferredTimeSlot}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-cream-50 rounded-xl text-xs">
                <div>
                  <span className="text-chocolate-500 block">Flavour:</span>
                  <span className="font-bold text-chocolate-900">{req.flavour}</span>
                </div>
                <div>
                  <span className="text-chocolate-500 block">Dietary:</span>
                  <span className="font-bold text-chocolate-900">
                    {req.eggless ? '100% Eggless' : 'Regular'}
                  </span>
                </div>
                <div>
                  <span className="text-chocolate-500 block">Colour Theme:</span>
                  <span className="font-bold text-chocolate-900">{req.colourTheme}</span>
                </div>
                <div>
                  <span className="text-chocolate-500 block">Target Budget:</span>
                  <span className="font-bold text-chocolate-900">
                    {formatRupees(req.estimatedBudget)}
                  </span>
                </div>
              </div>

              {/* Detailed Instructions */}
              <div>
                <span className="text-xs font-bold text-chocolate-700 uppercase tracking-wider block mb-1">
                  Design Specifications & Instructions:
                </span>
                <p className="text-xs text-chocolate-800 bg-cream-50 p-3 rounded-xl border border-cream-200 leading-relaxed italic">
                  "{req.detailedInstructions}"
                </p>
              </div>

              {/* Reference Images */}
              {req.referenceImages && req.referenceImages.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-chocolate-700 uppercase tracking-wider block mb-2">
                    Customer Reference Inspiration:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {req.referenceImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="w-24 h-24 rounded-xl overflow-hidden border-2 border-cream-200 hover:border-gold-500 transition block relative group"
                      >
                        <img src={img} alt="Inspiration" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold">
                          Expand
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Quote Display if already quoted */}
              {req.activeQuote && (
                <div className="p-4 bg-gold-50 border border-gold-300 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gold-900 uppercase">Active Issued Quotation:</span>
                    <span className="font-serif text-lg text-chocolate-950">
                      {formatRupees(req.activeQuote.quotedPrice)} (Deposit:{' '}
                      {formatRupees(req.activeQuote.depositRequired)})
                    </span>
                  </div>
                  <div className="text-chocolate-700">
                    Prep Time: {req.activeQuote.preparationTimeHours}h • Valid until:{' '}
                    {formatDate(req.activeQuote.validUntil)}
                  </div>
                  {req.activeQuote.adminNotes && (
                    <p className="text-chocolate-800 pt-1">
                      <strong>Chef Notes: </strong> {req.activeQuote.adminNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Actions & Messaging */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-cream-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setQuotePriceRupees(
                        req.activeQuote ? (req.activeQuote.quotedPrice / 100).toString() : '2500'
                      );
                      setDepositRupees(
                        req.activeQuote ? (req.activeQuote.depositRequired / 100).toString() : '1250'
                      );
                    }}
                    className="px-4 py-2 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition"
                  >
                    {req.activeQuote ? 'Revise Quote' : 'Issue Official Quote'}
                  </button>
                </div>

                {/* Quick reply message */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Send note to customer thread..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendAdminNote(req._id)}
                    className="px-3 py-1.5 bg-gold-500 text-chocolate-950 font-bold text-xs rounded-lg hover:bg-gold-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Quote Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-chocolate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
            <h3 className="font-serif font-bold text-xl text-chocolate-950">
              Issue Official Quote for {selectedReq.customerName}
            </h3>

            <form onSubmit={handleIssueQuote} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Total Quoted Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={quotePriceRupees}
                    onChange={(e) => {
                      setQuotePriceRupees(e.target.value);
                      setDepositRupees(Math.round(Number(e.target.value) / 2).toString());
                    }}
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Required Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={depositRupees}
                    onChange={(e) => setDepositRupees(e.target.value)}
                    placeholder="e.g. 1250"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Preparation Hours *
                  </label>
                  <input
                    type="number"
                    required
                    value={prepTimeHours}
                    onChange={(e) => setPrepTimeHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Quote Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">
                  Chef Feasibility Notes & Inclusions
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Price includes custom hand-modeled edible figurines, dowel structural assembly, and temperature-safe packaging."
                  className="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 border border-cream-300 rounded-xl font-bold text-chocolate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="px-5 py-2 bg-chocolate-900 text-gold-400 font-bold rounded-xl"
                >
                  {submittingQuote ? 'Sending...' : 'Transmit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomQuotesPage;
