'use client';

import React, { useRef, useState } from 'react';
import {
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineArrowUpTray,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export interface ExistingImage {
  id: string;
  url: string;
  isPrimary?: boolean;
}

interface ImageUploadProps {
  label?: string;
  description?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number; // default 5MB
  existingImages?: ExistingImage[];
  onRemoveExisting?: (id: string) => void;
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Product Images',
  description = 'Upload up to 10 high-resolution images (JPEG, PNG, WebP, max 5MB each). First image will be set as primary cover.',
  multiple = true,
  maxFiles = 10,
  maxSizeBytes = 5 * 1024 * 1024,
  existingImages = [],
  onRemoveExisting,
  selectedFiles,
  onFilesChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalCurrentFiles = existingImages.length + selectedFiles.length;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds 5MB size limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (totalCurrentFiles + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      const allowedCount = maxFiles - totalCurrentFiles;
      if (allowedCount > 0) {
        validFiles.splice(allowedCount);
      } else {
        return;
      }
    }

    if (multiple) {
      onFilesChange([...selectedFiles, ...validFiles]);
    } else {
      onFilesChange(validFiles.slice(0, 1));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveNew = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          <span className="text-[11px] text-slate-400 font-medium">
            {totalCurrentFiles} / {maxFiles} images
          </span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <HiOutlineArrowUpTray className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              <span className="text-indigo-600 hover:underline">Click to browse</span> or drag and drop image files
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports JPEG, PNG, WebP (up to 5MB each)
            </p>
          </div>
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-slate-400 leading-relaxed">{description}</p>
      )}

      {/* Previews Grid */}
      {(existingImages.length > 0 || selectedFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {/* Existing Images from Server */}
          {existingImages.map((img, idx) => (
            <div
              key={img.id || idx}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
            >
              <img
                src={img.url}
                alt="Product thumbnail"
                className="w-full h-full object-cover"
              />

              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shadow-xs">
                  Cover
                </span>
              )}

              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(img.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors shadow-xs"
                  title="Remove image"
                >
                  <HiOutlineXMark className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Newly Selected Local Files */}
          {selectedFiles.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            const isFirstOverall = existingImages.length === 0 && idx === 0;

            return (
              <div
                key={file.name + idx}
                className="group relative aspect-square rounded-xl overflow-hidden border border-indigo-200 bg-slate-100 shadow-xs ring-2 ring-indigo-500/20"
              >
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />

                {isFirstOverall && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shadow-xs">
                    Primary
                  </span>
                )}

                <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-900/80 text-white truncate text-center">
                  {(file.size / 1024).toFixed(0)} KB
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveNew(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors shadow-xs"
                  title="Remove from upload"
                >
                  <HiOutlineXMark className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
