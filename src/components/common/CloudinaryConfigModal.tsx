import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  X,
  Save,
  Trash2,
  Key,
  Folder,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCloudinaryConfig,
  setCloudinaryConfig,
  clearCloudinaryConfig,
  isCloudinaryConfigured,
  CloudinaryConfig,
} from '../../lib/cloudinary';

interface CloudinaryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const CloudinaryConfigModal: React.FC<CloudinaryConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [folder, setFolder] = useState('cfsi_portal');
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getCloudinaryConfig();
      setCloudName(cfg.cloudName);
      setUploadPreset(cfg.uploadPreset);
      setFolder(cfg.folder || 'cfsi_portal');
      setConfigured(isCloudinaryConfigured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cloudName.trim() || !uploadPreset.trim()) {
      toast.error('Both Cloud Name and Upload Preset are required.');
      return;
    }

    const config: CloudinaryConfig = {
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim(),
      folder: folder.trim() || 'cfsi_portal',
    };

    setCloudinaryConfig(config);
    setConfigured(true);
    toast.success('Cloudinary storage credentials saved successfully!');
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your stored Cloudinary credentials?')) {
      clearCloudinaryConfig();
      setCloudName('');
      setUploadPreset('');
      setFolder('cfsi_portal');
      setConfigured(false);
      toast.info('Cloudinary settings reset.');
      if (onConfigSaved) onConfigSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-heading font-black text-gray-900 dark:text-white">
                  Cloud Image Storage
                </h3>
                {configured ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Setup Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cloudinary CDN for direct photo uploads & auto WebP compression
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Cloud Name *</span>
              <span className="text-[10px] font-normal normal-case text-gray-400">From Cloudinary Dashboard</span>
            </label>
            <div className="relative">
              <Cloud className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                placeholder="e.g. cfsi-baroda"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Unsigned Upload Preset *</span>
              <span className="text-[10px] font-normal normal-case text-gray-400">Settings &gt; Upload</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                placeholder="e.g. cfsi_uploads"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Must be created with <strong>Signing Mode: Unsigned</strong> in your Cloudinary account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Storage Folder (Optional)</span>
              <span className="text-[10px] font-normal normal-case text-gray-400">Subfolder in Cloudinary</span>
            </label>
            <div className="relative">
              <Folder className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="cfsi_portal"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Quick Setup Instructions Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs text-gray-700 dark:text-gray-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Free 2-Minute Setup Guide:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
              <li>
                Create a 100% free account at{' '}
                <a
                  href="https://cloudinary.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-0.5"
                >
                  cloudinary.com <ExternalLink className="w-2.5 h-2.5 inline" />
                </a>{' '}
                (25 GB storage + 25 GB monthly bandwidth included).
              </li>
              <li>Copy your <strong>Cloud Name</strong> from the main Dashboard.</li>
              <li>
                In Cloudinary, go to <strong>Settings (gear icon) &gt; Upload &gt; Add upload preset</strong>.
              </li>
              <li>
                Set <strong>Signing Mode</strong> to <strong>Unsigned</strong>, enter a name (e.g. <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50">cfsi_uploads</code>), and click <strong>Save</strong>.
              </li>
            </ol>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
            <div>
              {configured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
