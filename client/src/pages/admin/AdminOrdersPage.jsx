import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  CheckCircle,
  Printer,
  ChevronRight,
} from 'lucide-react';
import api from '../../api/axios';
import { formatRupees, formatDate } from '../../utils/formatters';

const STATUS_TRANSITIONS = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected order for status update modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Orders fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !nextStatus) return;

    try {
      setUpdatingStatus(true);
      const res = await api.post(`/admin/orders/${selectedOrder._id}/status`, {
        nextStatus,
        note: statusNote,
      });

      if (res.data.success) {
        setActionMessage(`Order #${selectedOrder.orderNumber} updated to ${nextStatus}`);
        setOrders(orders.map((o) => (o._id === selectedOrder._id ? res.data.order : o)));
        setSelectedOrder(null);
        setNextStatus('');
        setStatusNote('');
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Status transition failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.open(`${api.defaults.baseURL}/admin/orders/export/csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Fulfillment & Kitchen Status
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
            Order Management ({orders.length})
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-cream-300 text-chocolate-800 text-xs font-bold hover:bg-cream-100 transition shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Filtered to CSV</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Order # or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-chocolate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none font-medium"
            >
              <option value="all">All Order Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing (Kitchen)</option>
              <option value="ready_for_pickup">Ready for Pick-up</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              title="Start Delivery Date"
            />
          </div>

          {/* End Date */}
          <div className="flex gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
              title="End Delivery Date"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-chocolate-900 text-gold-400 font-bold rounded-xl shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-chocolate-500 animate-pulse">
            Loading orders list...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-chocolate-600">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Delivery Schedule</th>
                  <th className="p-3.5">Cakes Summary</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((o) => {
                  const allowedTransitions = STATUS_TRANSITIONS[o.orderStatus] || [];
                  return (
                    <tr key={o._id} className="hover:bg-cream-50/70">
                      <td className="p-3.5 font-bold text-chocolate-950 whitespace-nowrap">
                        {o.orderNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold block">{o.customer?.name}</span>
                        <span className="text-chocolate-500 text-[11px] block">{o.customer?.phone}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold block">{formatDate(o.deliveryDate)}</span>
                        <span className="text-[11px] text-chocolate-600">{o.deliverySlotWindow}</span>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <span className="line-clamp-2 text-chocolate-800">
                          {o.items?.map((i) => `${i.title} (${i.weightLabel}) x${i.quantity}`).join('; ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-chocolate-950 whitespace-nowrap">
                        {formatRupees(o.pricing?.totalAmount)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="uppercase text-[10px] font-bold block">{o.paymentMethod}</span>
                        <span
                          className={`text-[10px] font-semibold ${
                            o.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            o.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : o.orderStatus === 'refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gold-100 text-gold-800'
                          }`}
                        >
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {allowedTransitions.length > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setNextStatus(allowedTransitions[0]);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-chocolate-900 text-gold-400 font-bold text-[11px] hover:bg-chocolate-800 transition shadow-sm"
                          >
                            Update Status
                          </button>
                        ) : (
                          <span className="text-chocolate-400 text-[11px] font-medium">Terminal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-chocolate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl animate-fade-in">
            <div>
              <span className="text-xs font-bold uppercase text-gold-600">Bakery State Machine</span>
              <h3 className="font-serif font-bold text-xl text-chocolate-950">
                Update Order #{selectedOrder.orderNumber}
              </h3>
              <p className="text-xs text-chocolate-600 mt-1">
                Current Status: <strong>{selectedOrder.orderStatus}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-chocolate-700 mb-1">
                  Permitted Next Transition
                </label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-bold text-chocolate-900 focus:outline-none"
                >
                  {(STATUS_TRANSITIONS[selectedOrder.orderStatus] || []).map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase().replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {nextStatus === 'cancelled' && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-[11px] leading-relaxed">
                  <strong>Automatic Restock Notice: </strong>
                  Cancelling will immediately restore the ordered units back to their respective variant stock in the database.
                </div>
              )}

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">
                  Audit / Notification Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master chef has begun ganache tempering"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-cream-300 rounded-xl font-bold text-chocolate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-chocolate-900 text-gold-400 font-bold rounded-xl"
                >
                  {updatingStatus ? 'Updating...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
