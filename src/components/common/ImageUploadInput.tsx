import React, { useState, useRef } from 'react';
import { UploadCloud, Trash2, RefreshCw, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, normalizeImageUrl } from '../../lib/api';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Paste image URL or Google Drive link...',
  helperText,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!value || value.startsWith('http'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocalUpload = value.startsWith('/api/uploads') || value.startsWith('/uploads');

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPG, PNG, WEBP, GIF) are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadImage(file);
      onChange(res.url);
      toast.success('Image saved directly to private server storage!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeImageUrl(raw);
    onChange(normalized);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-primary dark:text-primary-light hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL Box' : 'Paste URL instead'}</span>
        </button>
      </div>

      {/* Main Upload Box / Preview Box */}
      {value ? (
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-24 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 shrink-0 flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex-1 space-y-1.5 text-center sm:text-left min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                isLocalUpload
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>{isLocalUpload ? 'Private Local Storage' : 'External Image'}</span>
              </span>
            </div>

            <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate max-w-full">
              {value}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>Change Image</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-gray-300 dark:border-white/10 hover:border-primary/50 bg-gray-50/60 dark:bg-white/5 hover:bg-primary/5'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <RefreshCw className="w-7 h-7 text-primary animate-spin" />
              <p className="text-xs font-bold text-primary">Saving directly to server disk...</p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  Click or drag photo here to upload
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Saved 100% locally on server disk • JPG, PNG, WEBP, GIF up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Fallback URL Input */}
      {showUrlInput && (
        <div className="pt-1">
          <input
            type="text"
            value={value}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Tip: Google Drive share links are automatically converted into direct images.
          </p>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
