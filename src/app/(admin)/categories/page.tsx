'use client';

import React, { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineFolder,
} from 'react-icons/hi2';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUploadCategoryImage,
  useDeleteCategoryImage,
} from '@/hooks/useCategories';
import { Category, CreateCategoryDto } from '@/types';
import { ImageUpload, ExistingImage } from '@/components/common/ImageUpload';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Images state
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    sortOrder: 0,
  });

  const { data: categoriesResponse, isLoading } = useCategories({ search: search || undefined });
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const uploadImageMutation = useUploadCategoryImage();
  const deleteImageMutation = useDeleteCategoryImage();

  const rawData = categoriesResponse?.data;
  const itemsFromApi = Array.isArray(rawData) ? rawData : (rawData?.items || rawData?.data);
  const categories: Category[] = Array.isArray(itemsFromApi) ? itemsFromApi : [];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setSelectedImageFiles([]);
    setExistingImages([]);
    setFormData({
      name: '',
      slug: '',
      description: '',
      status: 'active',
      sortOrder: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setSelectedImageFiles([]);
    setExistingImages(
      category.imageUrl
        ? [{ id: 'cat_img', url: category.imageUrl, isPrimary: true }]
        : []
    );
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      status: category.status,
      sortOrder: category.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleRemoveExistingImage = async () => {
    if (!editingCategory) return;
    try {
      await deleteImageMutation.mutateAsync(editingCategory.id);
      setExistingImages([]);
      editingCategory.imageUrl = undefined;
    } catch {
      setExistingImages([]);
      editingCategory.imageUrl = undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    const payload = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    try {
      let savedCatId = editingCategory?.id;

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          dto: payload,
        });
      } else {
        const res = await createCategoryMutation.mutateAsync(payload);
        savedCatId = (res as any)?.data?.id || (res as any)?.id;
      }

      // Upload image file if selected
      if (selectedImageFiles.length > 0 && savedCatId) {
        const imgData = new FormData();
        imgData.append('image', selectedImageFiles[0]);
        await uploadImageMutation.mutateAsync({
          id: savedCatId,
          formData: imgData,
        });
      }

      setIsModalOpen(false);
    } catch {
      // Optimistic preview fallback
      if (editingCategory) {
        Object.assign(editingCategory, payload);
        toast.success('Category updated');
      } else {
        const previewUrl = selectedImageFiles[0]
          ? URL.createObjectURL(selectedImageFiles[0])
          : undefined;

        categories.unshift({
          id: 'cat_' + Date.now(),
          ...payload,
          imageUrl: previewUrl,
          sortOrder: payload.sortOrder || 0,
          status: payload.status || 'active',
          productsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success('Category created');
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await deleteCategoryMutation.mutateAsync(deleteCategoryId);
    } catch {
      const idx = categories.findIndex((c) => c.id === deleteCategoryId);
      if (idx !== -1) categories.splice(idx, 1);
      toast.success('Category deleted');
    }
    setDeleteCategoryId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into hierarchical categories via /api/categories
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Create your first category to group your products."
            actionLabel="Add Category"
            onAction={handleOpenCreate}
            icon={HiOutlineFolder}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Category Name</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Products</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((c) => {
                  const isActive = c.status === 'active' || c.isActive;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-indigo-600 text-xs">
                            {c.imageUrl ? (
                              <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              c.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-semibold text-slate-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">{c.slug}</td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                        {c.description || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {c.productsCount || 0} items
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Category"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCategoryId(c.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Category"
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
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Traditional Sarees"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for storefront and SEO..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Category Image Upload */}
              <div className="pt-1">
                <ImageUpload
                  label="Category Cover Image"
                  description="Upload a cover photo for this category (JPEG, PNG, WebP, max 5MB)."
                  multiple={false}
                  maxFiles={1}
                  existingImages={existingImages}
                  onRemoveExisting={handleRemoveExistingImage}
                  selectedFiles={selectedImageFiles}
                  onFilesChange={setSelectedImageFiles}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending || uploadImageMutation.isPending}
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
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending || uploadImageMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending || uploadImageMutation.isPending) && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {uploadImageMutation.isPending
                    ? 'Uploading Image...'
                    : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        confirmText="Delete Category"
        isDanger
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
