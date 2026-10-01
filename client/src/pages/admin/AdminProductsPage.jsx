import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Cake, Sparkles, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { formatRupees } from '../../utils/formatters';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    basePriceRupees: '650',
    discountPercent: 0,
    images: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    flavours: 'Belgian Chocolate, Dutch Truffle',
    isEgglessAvailable: true,
    isReadyMade: true,
    isBestSeller: false,
    isSeasonal: false,
    isFeatured: true,
    servingGuide: '0.5 kg serves 4-6 portions, 1 kg serves 8-12 portions',
    preparationTimeHours: 4,
    variants: [
      { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', priceRupees: '650', stockQuantity: 20 },
      { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', priceRupees: '1200', stockQuantity: 15 },
    ],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      if (catRes.data.categories?.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
      }
    } catch (err) {
      console.warn('Error loading products/categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      basePriceRupees: '650',
      discountPercent: 0,
      images: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      flavours: 'Belgian Chocolate, Dutch Truffle',
      isEgglessAvailable: true,
      isReadyMade: true,
      isBestSeller: false,
      isSeasonal: false,
      isFeatured: true,
      servingGuide: '0.5 kg serves 4-6 portions, 1 kg serves 8-12 portions',
      preparationTimeHours: 4,
      variants: [
        { weightGram: 500, weightLabel: '0.5 kg (Serves 4-6)', priceRupees: '650', stockQuantity: 20 },
        { weightGram: 1000, weightLabel: '1.0 kg (Serves 8-12)', priceRupees: '1200', stockQuantity: 15 },
      ],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      description: p.description,
      category: p.category?._id || p.category,
      basePriceRupees: (p.basePrice / 100).toString(),
      discountPercent: p.discountPercent || 0,
      images: p.images?.join(', ') || '',
      flavours: p.flavours?.join(', ') || '',
      isEgglessAvailable: p.isEgglessAvailable,
      isReadyMade: p.isReadyMade,
      isBestSeller: p.isBestSeller,
      isSeasonal: p.isSeasonal,
      isFeatured: p.isFeatured,
      servingGuide: p.servingGuide || '',
      preparationTimeHours: p.preparationTimeHours || 4,
      variants: p.variants?.map((v) => ({
        _id: v._id,
        weightGram: v.weightGram,
        weightLabel: v.weightLabel,
        priceRupees: (v.price / 100).toString(),
        stockQuantity: v.stockQuantity,
      })) || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        basePrice: Math.round(Number(formData.basePriceRupees) * 100), // paise
        discountPercent: Number(formData.discountPercent),
        images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
        flavours: formData.flavours.split(',').map((s) => s.trim()).filter(Boolean),
        isEgglessAvailable: Boolean(formData.isEgglessAvailable),
        isReadyMade: Boolean(formData.isReadyMade),
        isBestSeller: Boolean(formData.isBestSeller),
        isSeasonal: Boolean(formData.isSeasonal),
        isFeatured: Boolean(formData.isFeatured),
        servingGuide: formData.servingGuide,
        preparationTimeHours: Number(formData.preparationTimeHours),
        variants: formData.variants.map((v) => ({
          ...(v._id && { _id: v._id }),
          weightGram: Number(v.weightGram),
          weightLabel: v.weightLabel,
          price: Math.round(Number(v.priceRupees) * 100), // paise
          stockQuantity: Number(v.stockQuantity),
        })),
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save cake product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this product and its variants?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Artisanal Catalogue Inventory
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-chocolate-950 mt-1">
            Products & Variants ({products.length})
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider hover:bg-chocolate-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cake</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-chocolate-500 animate-pulse">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-chocolate-600">No cakes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-100 text-chocolate-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Photo</th>
                  <th className="p-3.5">Title & Category</th>
                  <th className="p-3.5">Base Price</th>
                  <th className="p-3.5">Weight Variants & Stock</th>
                  <th className="p-3.5">Flags</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-cream-50/70">
                    <td className="p-3.5">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-cream-200"
                      />
                    </td>
                    <td className="p-3.5 font-bold text-chocolate-950 max-w-xs">
                      <span className="block">{p.title}</span>
                      <span className="text-[11px] text-chocolate-500 font-normal">
                        {p.category?.name}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-chocolate-950 whitespace-nowrap">
                      {formatRupees(p.basePrice)}
                      {p.discountPercent > 0 && (
                        <span className="text-emerald-700 ml-1">({p.discountPercent}% off)</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        {p.variants?.map((v) => (
                          <div key={v._id} className="text-[11px] text-chocolate-700">
                            <strong>{v.weightLabel}:</strong> {formatRupees(v.price)} (
                            <span
                              className={
                                v.stockQuantity < 10
                                  ? 'text-red-600 font-bold'
                                  : 'text-emerald-700 font-semibold'
                              }
                            >
                              {v.stockQuantity} in stock
                            </span>
                            )
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.isBestSeller && (
                          <span className="bg-chocolate-900 text-gold-400 text-[10px] px-2 py-0.5 rounded font-bold">
                            Bestseller
                          </span>
                        )}
                        {p.isSeasonal && (
                          <span className="bg-blush-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                            Seasonal
                          </span>
                        )}
                        {p.isReadyMade && (
                          <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                            Ready-Made
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-chocolate-700 hover:text-gold-700 font-bold p-1"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-chocolate-400 hover:text-red-500 p-1"
                        title="Archive product"
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

      {/* Edit / Create Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-chocolate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl animate-fade-in">
            <h3 className="font-serif font-bold text-xl text-chocolate-950">
              {editingProduct ? 'Edit Artisanal Cake' : 'Create New Artisanal Cake'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-chocolate-700 mb-1">Cake Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Base Price (₹ for smallest variant) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basePriceRupees}
                    onChange={(e) => setFormData({ ...formData, basePriceRupees: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-chocolate-700 mb-1">
                    Prep Lead Hours *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTimeHours}
                    onChange={(e) =>
                      setFormData({ ...formData, preparationTimeHours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">
                  Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">
                  Flavours (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.flavours}
                  onChange={(e) => setFormData({ ...formData, flavours: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cream-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isEgglessAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isEgglessAvailable: e.target.checked })
                    }
                  />
                  <span>Eggless Option</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isReadyMade}
                    onChange={(e) => setFormData({ ...formData, isReadyMade: e.target.checked })}
                  />
                  <span>Ready-Made</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isSeasonal}
                    onChange={(e) => setFormData({ ...formData, isSeasonal: e.target.checked })}
                  />
                  <span>Seasonal</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-cream-200">
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
                  Save Cake Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
