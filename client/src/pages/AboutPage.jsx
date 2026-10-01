import React from 'react';
import { Sparkles, ShieldCheck, Heart, ChefHat, MapPin, Award } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const AboutPage = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
          Our Culinary Journey
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-chocolate-950 leading-tight">
          Baking Pure Artistry in Mankhurd, Mumbai
        </h1>
        <p className="text-base sm:text-lg text-chocolate-700 leading-relaxed font-normal">
          {settings?.tagline ||
            'Rich Cake Shop was founded with a singular conviction: every birthday, milestone anniversary, and quiet indulgence deserves authentic confectionery craftsmanship without compromise.'}
        </p>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-card border-4 border-white bg-cream-200">
          <img
            src="https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=1000&q=80"
            alt="Artisanal Bakery Kitchen"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4 text-sm text-chocolate-800 leading-relaxed">
          <h2 className="font-serif text-2xl font-bold text-chocolate-950">
            Pure Dairy, Zero Artificial Premixes
          </h2>
          <p>
            Unlike mass commercial cake factories that depend on chemical sponge stabilizers and pre-packaged artificial pastes, Rich Cake Shop prepares our artisanal batters daily from scratch in our Mankhurd West kitchen.
          </p>
          <p>
            We melt genuine 70% Callebaut Belgian dark chocolate, simmer fresh fruit reductions using Ratnagiri Alphonso mangoes and wild berries, and whip fresh farm dairy cream at sunrise.
          </p>
          <div className="p-4 bg-cream-100 rounded-2xl border border-cream-200 text-xs text-chocolate-700 space-y-1">
            <strong>Dedicated Vegetarian Hygiene: </strong>
            All our eggless creations are crafted in a strictly designated hygienic station with sterilized utensils.
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center mx-auto">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-chocolate-900">Master Craftsmanship</h3>
          <p className="text-xs text-chocolate-600 leading-relaxed">
            Multi-tier structural engineering, hand-piped Swiss buttercream textures, and 24k edible gold leaf gilding.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blush-100 text-blush-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-chocolate-900">Custom Design Studio</h3>
          <p className="text-xs text-chocolate-600 leading-relaxed">
            We collaborate one-on-one with customers to review design sketches and ensure timely delivery.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-soft text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-chocolate-900">Chilled Delivery</h3>
          <p className="text-xs text-chocolate-600 leading-relaxed">
            Every gateau travels in insulated, temperature-monitored carriers to protect soft buttercream roses from Mumbai humidity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
