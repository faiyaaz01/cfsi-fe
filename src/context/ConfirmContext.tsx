import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, AlertCircle, HelpCircle, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: 'trash' | 'alert' | 'warning' | 'info';
}

type ConfirmFunction = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
  }>({
    isOpen: false,
    options: { message: '' },
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((optionsOrMessage: ConfirmOptions | string): Promise<boolean> => {
    const options: ConfirmOptions =
      typeof optionsOrMessage === 'string'
        ? { message: optionsOrMessage }
        : optionsOrMessage;

    setDialogState({
      isOpen: true,
      options,
    });

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const { isOpen, options } = dialogState;
  const {
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    icon = type === 'danger' ? 'trash' : 'alert',
  } = options;

  // Keyboard handler for Escape and Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => handleClose(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-description"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden text-left"
            >
              {/* Close X button */}
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
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
                    id="confirm-dialog-title"
                    className="font-heading font-black text-lg text-gray-900 dark:text-white tracking-tight leading-snug"
                  >
                    {title}
                  </h3>
                  <div
                    id="confirm-dialog-description"
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
                  onClick={() => handleClose(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  autoFocus
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
                    type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                      : type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                      : 'bg-primary hover:bg-primary-hover shadow-primary/25'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFunction => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
