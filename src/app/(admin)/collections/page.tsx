'use client';

import React, { useState, useRef } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineCloudArrowUp,
  HiOutlinePhoto,
  HiOutlineTag,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from '@/hooks/useCollections';
import { useProducts } from '@/hooks/useProducts';
import { Collection, CreateCollectionDto, Product } from '@/types';
import toast from 'react-hot-toast';

export default function CollectionsPage() {
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCollectionDto>({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    isFeatured: false,
    sortOrder: 0,
    image: undefined,
    productIds: [],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: collectionsResponse } = useCollections();
  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({ limit: 100 });

  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const rawData = collectionsResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items);
  const collections: Collection[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  const rawProducts = productsResponse?.data;
  const availableProducts: Product[] = Array.isArray(rawProducts)
    ? rawProducts
    : (rawProducts?.items || rawProducts?.data || []);

  const filteredCollections = collections.filter((c) =>
    (c.name || c.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = availableProducts.filter((p) => {
    const term = productSearch.toLowerCase();
    const name = (p.name || p.title || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    return name.includes(term) || sku.includes(term);
  });

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      status: 'active',
      isFeatured: false,
      sortOrder: 0,
      image: undefined,
      productIds: [],
    });
    setImagePreview(null);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCollection(col);
    const initialProductIds = col.products?.map((p) => p.id) || [];
    setFormData({
      name: col.name || col.title || '',
      slug: col.slug || '',
      description: col.description || '',
      status: col.status || 'active',
      isFeatured: col.isFeatured || false,
      sortOrder: col.sortOrder || 0,
      image: undefined,
      productIds: initialProductIds,
    });
    setImagePreview(col.image || col.imageUrl || null);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleProductSelection = (productId: string) => {
    setFormData((prev) => {
      const current = prev.productIds || [];
      if (current.includes(productId)) {
        return { ...prev, productIds: current.filter((id) => id !== productId) };
      } else {
        return { ...prev, productIds: [...current, productId] };
      }
    });
  };

  const handleSelectAllProducts = () => {
    const allFilteredIds = filteredProducts.map((p) => p.id);
    setFormData((prev) => {
      const current = new Set(prev.productIds || []);
      allFilteredIds.forEach((id) => current.add(id));
      return { ...prev, productIds: Array.from(current) };
    });
  };

  const handleDeselectAllProducts = () => {
    setFormData((prev) => ({ ...prev, productIds: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Collection name is required');
      return;
    }

    const payload = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    try {
      if (editingCollection) {
        await updateMutation.mutateAsync({
          id: editingCollection.id,
          dto: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCollectionId) return;
    try {
      await deleteMutation.mutateAsync(deleteCollectionId);
    } catch {
      // Handled by mutation onError toast
    }
    setDeleteCollectionId(null);
  };

  const selectedCount = formData.productIds?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Curated Collections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Group themed items into storefront campaigns via /api/collections
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <EmptyState
          title="No collections found"
          description="Curate your first seasonal collection."
          actionLabel="Create Collection"
          onAction={handleOpenCreate}
          icon={HiOutlineSparkles}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((c) => {
            const isActive = c.status === 'active' || c.isActive;
            const name = c.name || c.title;
            const coverImage = c.image || c.imageUrl;
            const productCount = c.productCount ?? (c.products ? c.products.length : 0);

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image Header */}
                  <div className="relative h-40 bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 gap-1">
                        <HiOutlinePhoto className="w-8 h-8 stroke-1" />
                        <span className="text-[11px] font-medium">No Cover Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs ${
                          isActive
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-slate-700/80 text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>

                      {c.isFeatured && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-300/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base mb-1">{name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {c.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Slug: {c.slug}</span>
                      {c.sortOrder !== undefined && <span>Order: {c.sortOrder}</span>}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <HiOutlineTag className="w-3.5 h-3.5 text-indigo-500" />
                    {productCount} {productCount === 1 ? 'Product' : 'Products'}
                  </span>

                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCollectionId(c.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Summer Essentials 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Cover Image Upload Zone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Collection Cover Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="collection-image-upload"
                />

                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Collection preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-[11px] font-semibold bg-white text-slate-800 rounded-lg shadow-md hover:bg-slate-50 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 text-[11px] font-semibold bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {formData.image && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md backdrop-blur-sm">
                        {formData.image.name} · {(formData.image.size / 1024).toFixed(0)} KB
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <HiOutlineCloudArrowUp className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-700 font-semibold text-xs">
                        {isDragging ? 'Drop cover image here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        JPEG, PNG, or WebP cover photo
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. summer-essentials-2026 (auto-generated if empty)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of this collection..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Product Selection List */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    Include Products in Collection
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-mono text-[10px]">
                      {selectedCount} selected
                    </span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllProducts}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllProducts}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by title or SKU..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {isLoadingProducts ? (
                    <div className="p-4 text-center text-slate-400">Loading available products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No products found</div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = formData.productIds?.includes(p.id) || false;
                      const pName = p.name || p.title || 'Untitled Product';
                      const pImg = Array.isArray(p.images) && p.images.length > 0
                        ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any)?.url)
                        : null;
                      const price = p.basePrice || p.price || 0;

                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductSelection(p.id)}
                          className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {pImg ? (
                                <img src={pImg} alt={pName} className="w-full h-full object-cover" />
                              ) : (
                                <HiOutlinePhoto className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-semibold truncate text-xs ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                                {pName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                SKU: {p.sku || 'N/A'} · ${price}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <HiOutlineCheck className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="colFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="colFeatured" className="font-medium text-slate-700 cursor-pointer">
                  Featured Collection (Highlight on storefront homepage)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCollectionId}
        onClose={() => setDeleteCollectionId(null)}
        onConfirm={handleDelete}
        title="Delete Collection"
        message="Are you sure you want to delete this collection?"
        confirmText="Delete Collection"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
