import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, AlertCircle, HelpCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: 'trash' | 'alert' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon = type === 'danger' ? 'trash' : 'alert',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => {
              if (!isLoading) onCancel();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Dialog Card */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden text-left"
          >
            {/* Close X button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              {/* Icon badge */}
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  type === 'danger'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : type === 'warning'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                }`}
              >
                {icon === 'trash' ? (
                  <Trash2 className="w-6 h-6" />
                ) : icon === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : icon === 'info' ? (
                  <HelpCircle className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pr-4">
                <h3
                  id="confirm-modal-title"
                  className="font-heading font-black text-lg text-gray-900 dark:text-white tracking-tight leading-snug"
                >
                  {title}
                </h3>
                <div
                  id="confirm-modal-description"
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line"
                >
                  {message}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                disabled={isLoading}
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                autoFocus
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                  type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    : type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                    : 'bg-primary hover:bg-primary-hover shadow-primary/25'
                }`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
