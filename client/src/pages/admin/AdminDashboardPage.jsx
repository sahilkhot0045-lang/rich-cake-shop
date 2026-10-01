import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Package,
  Sparkles,
  Truck,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/axios';
import { formatRupees, formatDate } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/admin/orders/export/csv`, '_blank');
  };

  if (loading) {
    return <div className="text-sm text-chocolate-600 animate-pulse">Loading dashboard telemetry...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Real-Time Operations
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
            Bakery Management Console
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-cream-300 text-chocolate-800 text-xs font-bold hover:bg-cream-100 transition shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export All Orders to CSV</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Verified Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-chocolate-500 font-bold uppercase tracking-wider">
            <span>Verified Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-chocolate-950">
            {formatRupees(stats?.totalRevenuePaise || 0)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            From verified paid transactions
          </p>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-chocolate-500 font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-chocolate-100 text-chocolate-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-chocolate-950">
            {stats?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-chocolate-600">
            {stats?.statusCounts?.confirmed || 0} confirmed, {stats?.statusCounts?.preparing || 0} in oven
          </div>
        </div>

        {/* Metric 3: Pending Custom Quotes */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-chocolate-500 font-bold uppercase tracking-wider">
            <span>Pending Custom Quotes</span>
            <div className="w-8 h-8 rounded-xl bg-blush-100 text-blush-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-chocolate-950">
            {stats?.pendingQuotesCount || 0}
          </div>
          <Link
            to="/admin/custom-quotes"
            className="text-[11px] text-gold-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Review submitted designs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 4: Today Deliveries */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-chocolate-500 font-bold uppercase tracking-wider">
            <span>Scheduled Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-chocolate-950">
            {stats?.todayDeliveries || 0}
          </div>
          <p className="text-[11px] text-chocolate-600">Active slots booked for today</p>
        </div>
      </div>

      {/* Low-Stock Variant Alerts */}
      {stats?.lowStockVariants && stats.lowStockVariants.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-lg text-chocolate-950">
              Low-Stock Inventory Alerts ({stats.lowStockVariants.length} items below 10 units)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Cake Product</th>
                  <th className="p-3">Weight Variant</th>
                  <th className="p-3">Remaining Stock</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {stats.lowStockVariants.map((v) => (
                  <tr key={v._id}>
                    <td className="p-3 font-semibold text-chocolate-900">{v.product?.title}</td>
                    <td className="p-3">{v.weightLabel}</td>
                    <td className="p-3 font-bold text-red-600">{v.stockQuantity} units left</td>
                    <td className="p-3 font-medium">{formatRupees(v.price)}</td>
                    <td className="p-3">
                      <Link
                        to="/admin/products"
                        className="text-xs font-bold text-gold-700 hover:underline"
                      >
                        Adjust Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-cream-100">
          <h3 className="font-serif font-bold text-lg text-chocolate-950">
            Recent Incoming Orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-gold-700 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Delivery Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {stats?.recentOrders?.map((o) => (
                <tr key={o._id} className="hover:bg-cream-50">
                  <td className="p-3 font-bold text-chocolate-950">{o.orderNumber}</td>
                  <td className="p-3">
                    <span className="font-semibold block">{o.customer?.name}</span>
                    <span className="text-chocolate-500 text-[11px]">{o.customer?.phone}</span>
                  </td>
                  <td className="p-3">{formatDate(o.deliveryDate)}</td>
                  <td className="p-3 font-bold text-chocolate-900">
                    {formatRupees(o.pricing?.totalAmount)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        o.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gold-100 text-gold-800'
                      }`}
                    >
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/track/${o.orderNumber}`}
                      className="text-xs font-bold text-chocolate-800 hover:text-gold-700"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
