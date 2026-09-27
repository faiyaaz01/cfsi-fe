import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  X,
  RotateCw,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { processAndUploadImage } from '../../lib/imageProcessor';
import { isCloudinaryConfigured } from '../../lib/cloudinary';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label = 'Upload Photo / Image',
  helperText = 'Select any JPG, PNG, or WEBP photo from your computer or phone',
  placeholder = 'https://images.unsplash.com/... or paste image URL',
  required = false,
  className = '',
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP, GIF, SVG).');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(15);

      const resultUrl = await processAndUploadImage(
        file,
        { maxWidth: 1600, maxHeight: 1600, quality: 0.82 },
        (percent) => setUploadProgress(percent)
      );

      onChange(resultUrl);
      toast.success('Photo ready and attached!');
    } catch (err: any) {
      console.error('Image processing error:', err);
      toast.error(err.message || 'Failed to process image. Please try another file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCloudinary = value && value.includes('cloudinary.com');
  const isBase64 = value && value.startsWith('data:image/');

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Mode Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
        >
          {showUrlInput ? (
            <>
              <UploadCloud className="w-3 h-3" />
              <span>Direct File Upload</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              <span>Or enter web link</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
          }
        }}
      />

      {/* Existing Photo Preview Card */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-gray-900/10 dark:bg-white/10 shrink-0 relative group">
            <img
              src={value}
              alt="Selected Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
              }}
            />
            {!isBase64 && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/90 text-gray-900 hover:scale-105 transition-transform"
                  title="Open full image"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {isCloudinary ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Cloud CDN</span>
                </span>
              ) : isBase64 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Direct Upload (Web Optimized)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <LinkIcon className="w-3 h-3" />
                  <span>Web Link</span>
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Photo selected and ready to save.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/15 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Replace Photo</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : showUrlInput ? (
        /* Alternate URL Input Mode */
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Paste any direct HTTPS image link, or switch back to "Direct File Upload" above.
          </p>
        </div>
      ) : (
        /* Primary Direct Drag-and-Drop & File Picker */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]'
              : 'border-gray-200 dark:border-white/10 hover:border-primary/60 dark:hover:border-primary/60 bg-gray-50/80 dark:bg-white/[0.02]'
          } ${isUploading ? 'pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="space-y-3 py-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center animate-spin">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Optimizing and uploading photo... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                </p>
                <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadProgress || 50}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                  <span className="text-primary hover:underline font-extrabold">Choose Image from Computer</span> or drag & drop here
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Direct upload for JPG, PNG, WEBP (No URL needed)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && !value && !showUrlInput && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <ImageIcon className="w-3 h-3 shrink-0" />
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
};
