import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { formatRupees } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const pricePaise = selectedVariant ? selectedVariant.price : product.basePrice;
  const originalPricePaise = product.discountPercent
    ? Math.round(pricePaise / (1 - product.discountPercent / 100))
    : pricePaise;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || adding) return;

    try {
      setAdding(true);
      await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: 1,
        eggless: product.isEgglessAvailable,
        flavour: product.flavours?.[0] || 'Signature',
        inscription: '',
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-cream-200 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.isBestSeller && (
          <span className="bg-chocolate-900 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-400" />
            Bestseller
          </span>
        )}
        {product.isSeasonal && (
          <span className="bg-blush-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Seasonal
          </span>
        )}
        {product.isReadyMade && (
          <span className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Ready in 30 Mins
          </span>
        )}
      </div>

      {product.discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-gold-500 text-chocolate-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
          {product.discountPercent}% OFF
        </div>
      )}

      {/* Image with zoom on hover */}
      <Link
        to={`/product/${product.slug}`}
        className="block aspect-[4/3] w-full overflow-hidden bg-cream-100 relative"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-chocolate-600 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-gold-700">
              {product.category?.name || 'Artisanal Cake'}
            </span>
            <div className="flex items-center gap-1 text-chocolate-800 font-bold">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
              <span>{product.ratingsAverage.toFixed(1)}</span>
              {product.ratingsQuantity > 0 && (
                <span className="text-chocolate-400 font-normal">({product.ratingsQuantity})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif font-bold text-chocolate-900 text-lg group-hover:text-gold-700 transition leading-snug line-clamp-2">
              {product.title}
            </h3>
          </Link>

          {/* Dietary tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {product.isEgglessAvailable && (
              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-medium">
                100% Eggless Option
              </span>
            )}
            {product.dietaryInfo?.isGlutenFree && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                Gluten-Free
              </span>
            )}
          </div>
        </div>

        {/* Weight Variant Selector & Pricing */}
        <div className="pt-4 mt-4 border-t border-cream-200">
          {product.variants && product.variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.variants.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                    selectedVariant?._id === v._id
                      ? 'border-chocolate-900 bg-chocolate-900 text-white font-bold'
                      : 'border-cream-300 text-chocolate-700 hover:border-chocolate-600 bg-cream-50'
                  }`}
                >
                  {v.weightLabel.split(' ')[0]} {v.weightLabel.split(' ')[1]}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-bold text-chocolate-950 text-xl">
                  {formatRupees(pricePaise)}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-xs text-chocolate-400 line-through">
                    {formatRupees(originalPricePaise)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-chocolate-600 block">
                {selectedVariant ? selectedVariant.weightLabel : '0.5 kg'}
              </span>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={adding}
              className={`p-2.5 rounded-xl flex items-center justify-center transition shadow-sm ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gold-500 hover:bg-gold-600 text-chocolate-950 font-semibold'
              }`}
              title="Quick Add to Cart"
            >
              {added ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-chocolate-950" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
