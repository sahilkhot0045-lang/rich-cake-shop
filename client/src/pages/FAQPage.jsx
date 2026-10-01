import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How far in advance should I order ready-made vs made-to-order cakes?',
    a: 'For our ready-made and signature counter cakes, you can order for delivery in as little as 3-4 hours (or same-day pick-up). For personalized celebration cakes and bespoke multi-tier designer cakes, we recommend requesting a quote at least 48 to 72 hours in advance to allow our pastry chefs adequate preparation time.',
  },
  {
    q: 'Are all your cakes available in 100% Eggless variations?',
    a: 'Yes, every single cake flavour in our catalogue can be prepared as 100% eggless. We utilize pure dairy cream, buttermilk, and food-grade vegetable starches to guarantee identical moisture, lightness, and rich taste.',
  },
  {
    q: 'Which PIN codes in Mumbai do you deliver to?',
    a: 'We cover Mankhurd (400088), Chembur (400071, 400074), Govandi (400043), Ghatkopar (400077, 400075), Kurla (400070), Sion (400022), and Navi Mumbai (400703, 400705). You can verify your exact PIN code on any cake detail page.',
  },
  {
    q: 'How are cakes transported during hot or humid weather?',
    a: 'All cake deliveries are handled via temperature-insulated, chilled carrying boxes with cold gel packs. Our couriers are trained specifically in upright, shock-free pastry transit.',
  },
  {
    q: 'How does the Custom Cake Quote process work?',
    a: 'You submit your design inspiration, preferred cake weight, tiers, shape, and delivery date through our Custom Cake Studio. Our master chef evaluates structural feasibility and responds with an official price quote and deposit requirement. Once you accept and pay the deposit online, your baking slot is confirmed.',
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'Cancellations requested 24 hours or more before the chosen delivery slot are eligible for a 100% full refund to the original payment source. Same-day cancellations cannot be refunded because baking begins early in the morning.',
  },
];

const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
          Got Questions?
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-chocolate-950">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-chocolate-700">
          Everything you need to know about cake ordering, delivery slots, eggless bakes, and custom quotes.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-cream-200 shadow-soft overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 font-serif font-bold text-base text-chocolate-950 hover:text-gold-700 transition"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gold-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-chocolate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-chocolate-700 leading-relaxed border-t border-cream-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQPage;
