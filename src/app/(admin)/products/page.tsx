'use client';

import React, { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { StatusChip } from '@/components/common/StatusChip';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatCurrency } from '@/lib/utils';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUploadProductImages,
  useDeleteProductImage,
} from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Product, CreateProductDto, UpdateProductDto, Category } from '@/types';
import { ImageUpload, ExistingImage } from '@/components/common/ImageUpload';
import { VariantManager } from '@/components/products/VariantManager';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Images state
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  const uploadImagesMutation = useUploadProductImages();
  const deleteImageMutation = useDeleteProductImage();

  // Form State
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    basePrice: 1999,
    discountPrice: 1699,
    status: 'active',
    isFeatured: false,
    description: '',
    variants: [
      {
        sku: 'VAS-VAR-01',
        price: 1999,
        discountPrice: 1699,
        stockQuantity: 25,
        size: 'Free Size',
        color: 'Standard',
      },
    ],
  });

  const { data: productsResponse, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    categoryId: categoryFilter || undefined,
    status: statusFilter || undefined,
  });

  const { data: categoriesResponse } = useCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // API returns { items: [...], total, page, totalPages } OR { data: [...] }
  const rawData = productsResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.items || rawData?.data);
  const products: Product[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];
  const totalPages = (rawData as any)?.totalPages || (rawData as any)?.meta?.totalPages || 1;

  const rawCats = categoriesResponse?.data;
  const categories: Category[] = Array.isArray(rawCats) ? rawCats : (rawCats?.items || rawCats?.data || []);

  const filteredProducts = products.filter((p: any) => {
    if (categoryFilter && p.categoryId !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const pName = p.name || p.title || '';
      return (
        pName.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setSelectedImageFiles([]);
    setExistingImages([]);
    const initialSku = 'VAS-' + Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      slug: '',
      description: '',
      categoryId: categories[0]?.id || '',
      basePrice: 1999,
      discountPrice: 1699,
      sku: initialSku,
      isFeatured: false,
      status: 'active',
      variants: [
        {
          sku: initialSku + '-M',
          size: 'M',
          color: 'Navy Blue',
          price: 1999,
          discountPrice: 1699,
          stockQuantity: 25,
          isActive: true,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedImageFiles([]);
    setExistingImages(
      (product.images || []).map((img: any) => ({
        id: typeof img === 'string' ? img : img.id,
        url: typeof img === 'string' ? img : img.url,
        isPrimary: typeof img === 'string' ? false : img.isPrimary,
      }))
    );
    setFormData({
      name: product.name || product.title || '',
      slug: product.slug || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      basePrice: product.basePrice || product.price || 0,
      discountPrice: product.discountPrice || (product as any).compareAtPrice || undefined,
      sku: product.sku || '',
      isFeatured: product.isFeatured || false,
      status: (product.status as any) || 'active',
      variants: (product.variants && product.variants.length > 0)
        ? product.variants.map((v) => ({
            sku: v.sku,
            price: v.price || product.basePrice || 0,
            discountPrice: v.discountPrice,
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity ?? 0,
            isActive: v.isActive ?? true,
          }))
        : [],
    });
    setIsModalOpen(true);
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!editingProduct) return;
    try {
      await deleteImageMutation.mutateAsync({
        productId: editingProduct.id,
        imageId,
      });
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      if (editingProduct.images) {
        editingProduct.images = (editingProduct.images as any[]).filter(
          (img: any) => (typeof img === 'string' ? img : img.id) !== imageId
        ) as any;
      }
    } catch {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      if (editingProduct.images) {
        editingProduct.images = (editingProduct.images as any[]).filter(
          (img: any) => (typeof img === 'string' ? img : img.id) !== imageId
        ) as any;
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || formData.basePrice <= 0) {
      toast.error('Please enter valid product name, category, and price');
      return;
    }

    try {
      let savedProductId = editingProduct?.id;

      if (editingProduct) {
        // Build partial payload containing ONLY modified fields
        const updatePayload: UpdateProductDto = {};

        const origName = (editingProduct.name || editingProduct.title || '').trim();
        const newName = formData.name.trim();
        if (newName && newName !== origName) {
          updatePayload.name = newName;
        }

        if (formData.categoryId && formData.categoryId !== editingProduct.categoryId) {
          updatePayload.categoryId = formData.categoryId;
        }

        const origBasePrice = Number(editingProduct.basePrice || editingProduct.price || 0);
        const newBasePrice = Number(formData.basePrice);
        if (newBasePrice > 0 && newBasePrice !== origBasePrice) {
          updatePayload.basePrice = newBasePrice;
        }

        const origDiscountPrice = editingProduct.discountPrice !== undefined
          ? Number(editingProduct.discountPrice)
          : ((editingProduct as any).compareAtPrice !== undefined ? Number((editingProduct as any).compareAtPrice) : undefined);
        const newDiscountPrice = formData.discountPrice ? Number(formData.discountPrice) : undefined;
        if (newDiscountPrice !== origDiscountPrice) {
          if (newDiscountPrice && newDiscountPrice > 0) {
            updatePayload.discountPrice = newDiscountPrice;
          }
        }

        const origSku = (editingProduct.sku || '').trim();
        const newSku = (formData.sku || '').trim();
        if (newSku && newSku !== origSku) {
          updatePayload.sku = newSku;
        }

        const origDesc = (editingProduct.description || '').trim();
        const newDesc = (formData.description || '').trim();
        if (newDesc !== origDesc) {
          updatePayload.description = newDesc;
        }

        const origSlug = (editingProduct.slug || '').trim();
        const newSlug = (formData.slug || '').trim();
        if (newSlug && newSlug !== origSlug) {
          updatePayload.slug = newSlug;
        }

        const origStatus = (editingProduct.status || 'active').toLowerCase();
        const newStatus = (formData.status || 'active').toLowerCase();
        if (newStatus !== origStatus) {
          updatePayload.status = formData.status === 'active' ? 'active' : 'inactive';
        }

        const origFeatured = Boolean(editingProduct.isFeatured);
        const newFeatured = Boolean(formData.isFeatured);
        if (newFeatured !== origFeatured) {
          updatePayload.isFeatured = newFeatured;
        }

        // Only include variants if variants were actually modified
        if (formData.variants && formData.variants.length > 0 && editingProduct.variants && editingProduct.variants.length > 0) {
          const normalizeVariant = (v: any) => ({
            sku: (v.sku || '').trim(),
            price: Number(v.price || 0),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
            size: (v.size || '').trim(),
            color: (v.color || '').trim(),
            stockQuantity: Number(v.stockQuantity ?? (v as any).stock ?? 0),
            isActive: Boolean(v.isActive ?? true),
          });

          const origVariants = editingProduct.variants.map(normalizeVariant);
          const curVariants = formData.variants.map(normalizeVariant);

          if (JSON.stringify(origVariants) !== JSON.stringify(curVariants)) {
            updatePayload.variants = formData.variants.map((v) => ({
              sku: v.sku.trim(),
              price: Number(v.price || formData.basePrice),
              discountPrice: v.discountPrice && Number(v.discountPrice) > 0 ? Number(v.discountPrice) : undefined,
              size: v.size?.trim() || undefined,
              color: v.color?.trim() || undefined,
              stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : undefined,
              isActive: v.isActive ?? true,
            }));
          }
        }

        // Only execute PATCH if there are modified fields
        if (Object.keys(updatePayload).length > 0) {
          await updateProductMutation.mutateAsync({
            id: editingProduct.id,
            dto: updatePayload,
          });
        } else if (selectedImageFiles.length === 0) {
          toast('No changes detected', { icon: 'ℹ️' });
          setIsModalOpen(false);
          return;
        }
      } else {
        // Create mode: build full CreateProductDto
        const payload: CreateProductDto = {
          name: formData.name.trim(),
          categoryId: formData.categoryId,
          basePrice: Number(formData.basePrice),
          status: formData.status === 'active' ? 'active' : 'inactive',
          isFeatured: Boolean(formData.isFeatured),
        };

        if (formData.sku?.trim()) payload.sku = formData.sku.trim();
        if (formData.description?.trim()) payload.description = formData.description.trim();
        if (formData.slug?.trim()) payload.slug = formData.slug.trim();
        if (formData.discountPrice && Number(formData.discountPrice) > 0) {
          payload.discountPrice = Number(formData.discountPrice);
        }
        if (formData.variants && formData.variants.length > 0) {
          payload.variants = formData.variants.map((v) => {
            const variantItem: any = {
              sku: v.sku.trim(),
              price: Number(v.price || formData.basePrice),
              isActive: v.isActive ?? true,
            };
            if (v.size?.trim()) variantItem.size = v.size.trim();
            if (v.color?.trim()) variantItem.color = v.color.trim();
            if (v.discountPrice && Number(v.discountPrice) > 0) {
              variantItem.discountPrice = Number(v.discountPrice);
            }
            if (v.stockQuantity !== undefined && v.stockQuantity !== null) {
              variantItem.stockQuantity = Number(v.stockQuantity);
            }
            return variantItem;
          });
        }

        const createRes = await createProductMutation.mutateAsync(payload);
        savedProductId = (createRes as any)?.data?.id || (createRes as any)?.id;
      }

      // Upload newly selected image files if any
      if (selectedImageFiles.length > 0 && savedProductId) {
        const imgData = new FormData();
        selectedImageFiles.forEach((file) => imgData.append('images', file));
        imgData.append('isPrimary', 'true');
        await uploadImagesMutation.mutateAsync({
          id: savedProductId,
          formData: imgData,
        });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProductMutation.mutateAsync(deleteProductId);
    } catch {
      const idx = products.findIndex((p) => p.id === deleteProductId);
      if (idx !== -1) products.splice(idx, 1);
      toast.success('Product deleted');
    }
    setDeleteProductId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store catalog, pricing, variants, and stock via /api/products
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Get started by adding your first product to the catalog."
            actionLabel="Add Product"
            onAction={handleOpenCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Product Name</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Variants / Stock</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {products.map((p) => {
                    const price = p.basePrice || p.price || 0;
                    const discount = p.discountPrice || p.compareAtPrice;
                    const variantCount = p.variants?.length || 0;
                    const stock = p.stock || p.variants?.[0]?.stockQuantity || 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-indigo-600 text-sm">
                              {p.images && p.images.length > 0 ? (
                                <img
                                  src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (p.name || p.title || 'P').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate max-w-xs">
                                {p.name || p.title}
                              </h4>
                              <span className="text-[11px] text-slate-400">
                                {p.category?.name || 'Catalog Item'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {p.sku || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900">
                            {formatCurrency(price)}
                          </span>
                          {discount && discount > price ? (
                            <span className="ml-1.5 text-[10px] text-slate-400 line-through">
                              {formatCurrency(discount)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-slate-700">
                            {variantCount > 0 ? `${variantCount} variant(s)` : `${stock} in stock`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusChip status={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Product"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteProductId(p.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Product"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product (with Variant)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Classic Silk Kurta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. VAS-KUR-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step={0.01}
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discountPrice || 0}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product fabric description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Image Upload Zone */}
              <div className="pt-1">
                <ImageUpload
                  label="Product Media & Gallery"
                  description="Select up to 10 images (JPEG, PNG, WebP, max 5MB each). Uploads directly to Cloudinary and links to product."
                  multiple
                  maxFiles={10}
                  existingImages={existingImages}
                  onRemoveExisting={handleRemoveExistingImage}
                  selectedFiles={selectedImageFiles}
                  onFilesChange={setSelectedImageFiles}
                  disabled={createProductMutation.isPending || updateProductMutation.isPending || uploadImagesMutation.isPending}
                />
              </div>

              {/* Product Variants Section */}
              <VariantManager
                variants={formData.variants || []}
                onChange={(variants) => setFormData({ ...formData, variants })}
                basePrice={formData.basePrice}
                baseSku={formData.sku}
                disabled={createProductMutation.isPending || updateProductMutation.isPending || uploadImagesMutation.isPending}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prodFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="prodFeatured" className="font-medium text-slate-700 cursor-pointer">
                  Feature on storefront homepage
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
                  disabled={createProductMutation.isPending || updateProductMutation.isPending || uploadImagesMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending || uploadImagesMutation.isPending) && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {uploadImagesMutation.isPending
                    ? 'Uploading Images...'
                    : editingProduct
                    ? 'Save Changes'
                    : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText="Delete Product"
        isDanger
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
