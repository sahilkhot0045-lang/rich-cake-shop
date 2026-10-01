import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/shop/ProductCard';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedFlavour = searchParams.get('flavour') || '';
  const egglessOnly = searchParams.get('eggless') === 'true';
  const glutenFree = searchParams.get('glutenFree') === 'true';
  const sugarFree = searchParams.get('sugarFree') === 'true';
  const readyMade = searchParams.get('readyMade') === 'true';
  const seasonal = searchParams.get('seasonal') === 'true';
  const bestSeller = searchParams.get('bestSeller') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'popular';
  const page = Number(searchParams.get('page')) || 1;

  // Fetch categories on mount
  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    });
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('limit', '12');

        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages);
          setTotalCount(res.data.totalCount);
        }
      } catch (err) {
        console.warn('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset page on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const flavourOptions = [
    'Belgian Chocolate',
    'Dutch Truffle',
    'Alphonso Mango',
    'Red Velvet',
    'Hazelnut Praline',
    'Blueberry Swirl',
    'Black Forest',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-cream-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Artisanal Mumbai Bakery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-chocolate-950 mt-1">
            Artisan Cakes Catalogue
          </h1>
          <p className="text-sm text-chocolate-600 mt-1">
            Showing {totalCount} freshly baked gourmet and ready-made creations
          </p>
        </div>

        {/* Sort & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-cream-300 text-chocolate-800 text-sm font-semibold shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-gold-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-cream-300 text-sm">
            <span className="text-xs text-chocolate-500 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent font-semibold text-chocolate-900 focus:outline-none cursor-pointer"
            >
              <option value="popular">Popularity & Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <h3 className="font-serif font-bold text-chocolate-900 text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-gold-600" />
                Refine Catalogue
              </h3>
              {(search || selectedCategory || selectedFlavour || egglessOnly || glutenFree || sugarFree || readyMade || minPrice || maxPrice) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                Search Cake
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Belgian, Mango..."
                  value={search}
                  onChange={(e) => updateParam('search', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                />
                <Search className="w-3.5 h-3.5 text-chocolate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition ${
                    !selectedCategory
                      ? 'bg-chocolate-900 text-gold-400 font-bold'
                      : 'text-chocolate-700 hover:bg-cream-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => updateParam('category', c._id)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition ${
                      selectedCategory === c._id
                        ? 'bg-chocolate-900 text-gold-400 font-bold'
                        : 'text-chocolate-700 hover:bg-cream-100'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Eggless & Dietary Preferences */}
            <div className="pt-4 border-t border-cream-100 space-y-3">
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider">
                Dietary & Preferences
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-chocolate-900">
                <input
                  type="checkbox"
                  checked={egglessOnly}
                  onChange={(e) => updateParam('eggless', e.target.checked ? 'true' : '')}
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <span>100% Eggless Cakes Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-chocolate-800">
                <input
                  type="checkbox"
                  checked={readyMade}
                  onChange={(e) => updateParam('readyMade', e.target.checked ? 'true' : '')}
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <span>Ready-Made (Express 30 Mins)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-chocolate-800">
                <input
                  type="checkbox"
                  checked={glutenFree}
                  onChange={(e) => updateParam('glutenFree', e.target.checked ? 'true' : '')}
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <span>Gluten-Free Cakes</span>
              </label>
            </div>

            {/* Price Range Filter (in Rupees) */}
            <div className="pt-4 border-t border-cream-100">
              <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                />
                <span className="text-chocolate-400">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-cream-200 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 text-chocolate-600 flex items-center justify-center mx-auto text-2xl font-serif">
                🎂
              </div>
              <h3 className="font-serif text-2xl font-bold text-chocolate-900">
                No artisanal cakes match your criteria
              </h3>
              <p className="text-sm text-chocolate-600 max-w-md mx-auto">
                Try clearing active search or dietary filters, or contact our studio for a bespoke custom cake baked to your specifications.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider hover:bg-chocolate-800 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => updateParam('page', String(page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-cream-300 bg-white text-chocolate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateParam('page', String(pageNum))}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                      page === pageNum
                        ? 'bg-chocolate-900 text-gold-400 shadow-sm'
                        : 'bg-white border border-cream-300 text-chocolate-700 hover:bg-cream-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => updateParam('page', String(page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-cream-300 bg-white text-chocolate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-chocolate-950/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="font-serif font-bold text-lg text-chocolate-900">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-6 h-6 text-chocolate-700" />
                </button>
              </div>

              {/* Eggless */}
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-chocolate-900">
                <input
                  type="checkbox"
                  checked={egglessOnly}
                  onChange={(e) => updateParam('eggless', e.target.checked ? 'true' : '')}
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <span>100% Eggless Cakes Only</span>
              </label>

              {/* Ready Made */}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-chocolate-800">
                <input
                  type="checkbox"
                  checked={readyMade}
                  onChange={(e) => updateParam('readyMade', e.target.checked ? 'true' : '')}
                  className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                />
                <span>Ready-Made (30 Mins)</span>
              </label>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-chocolate-700 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => updateParam('category', e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-lg text-sm bg-cream-50"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-cream-200 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-sm shadow-md"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-chocolate-600 hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
