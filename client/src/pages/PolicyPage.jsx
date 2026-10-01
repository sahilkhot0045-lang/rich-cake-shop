import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, FileText, MapPin, CheckCircle } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatRupees } from '../utils/formatters';

const PolicyPage = () => {
  const { type } = useParams(); // 'delivery', 'refunds', 'privacy', 'terms'
  const { settings } = useStoreSettings();

  const getPolicyDetails = () => {
    switch (type) {
      case 'delivery':
        return {
          title: 'Delivery Coverage & Shipping Policy',
          icon: Truck,
          content:
            settings?.policies?.deliveryPolicy ||
            'We provide temperature-controlled doorstep delivery across Mankhurd, Chembur, Govandi, Ghatkopar, Sion, and Navi Mumbai. All gateaux travel inside insulated thermal cooler bags with dry chill packs to safeguard delicate ganache and buttercream from external Mumbai heat.',
        };
      case 'refunds':
        return {
          title: 'Refund & Cancellation Policy',
          icon: RefreshCw,
          content:
            settings?.policies?.cancellationRefundPolicy ||
            'We understand that celebration plans can change. Orders cancelled 24 hours or more before the chosen delivery date are eligible for a 100% full refund directly to the original payment source. Same-day cancellations cannot be refunded as artisan baking and custom sponge prep commence early at dawn.',
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: ShieldCheck,
          content:
            settings?.policies?.privacyPolicy ||
            'Rich Cake Shop is committed to protecting your personal data. We collect customer names, phone numbers, delivery addresses, and emails strictly for the purpose of order coordination, delivery routing, and invoice delivery. We never share customer data with third-party advertisers.',
        };
      case 'terms':
      default:
        return {
          title: 'Terms & Conditions',
          icon: FileText,
          content:
            settings?.policies?.termsAndConditions ||
            'All products are sold in Indian Rupees (INR) inclusive of applicable taxes. Order confirmation occurs upon valid online payment verification or COD eligibility check. Custom cake quote pricing is valid until the specified expiry date.',
        };
    }
  };

  const policy = getPolicyDetails();
  const Icon = policy.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center mx-auto">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950">
          {policy.title}
        </h1>
        <p className="text-xs text-chocolate-500">
          Official store policy for Rich Cake Shop, Mankhurd, Mumbai
        </p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-soft space-y-6 text-sm text-chocolate-800 leading-relaxed">
        <p className="whitespace-pre-line text-base">{policy.content}</p>

        {/* If delivery policy, render live delivery zones table */}
        {type === 'delivery' && settings?.deliveryZones && (
          <div className="pt-6 border-t border-cream-200 space-y-4">
            <h3 className="font-serif font-bold text-lg text-chocolate-950">
              Active Delivery Zones & Fees (Paise-Precision Authoritative)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Zone Name</th>
                    <th className="p-3">Covered PIN Codes</th>
                    <th className="p-3">Delivery Charge</th>
                    <th className="p-3 rounded-r-xl">Free Delivery Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {settings.deliveryZones.map((z, idx) => (
                    <tr key={idx} className="hover:bg-cream-50">
                      <td className="p-3 font-semibold text-chocolate-900">{z.zoneName}</td>
                      <td className="p-3 font-mono">{z.pincodes.join(', ')}</td>
                      <td className="p-3 font-bold text-chocolate-900">{formatRupees(z.deliveryFee)}</td>
                      <td className="p-3 text-emerald-700 font-bold">
                        Orders above {formatRupees(z.freeDeliveryThreshold)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyPage;
