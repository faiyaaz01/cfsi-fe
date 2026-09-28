import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

export interface UnsavedWarningOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Custom hook to protect against accidental data loss when attendance marks are unsaved.
 * 
 * Intercepts:
 * 1. Browser tab close, reload (F5 / Ctrl+R), or external navigation (beforeunload)
 * 2. In-app navigation via Navbar, Sidebar, or any internal <Link> tags (DOM capture click)
 * 3. Browser Back / Forward buttons (popstate)
 */
export const useUnsavedChangesWarning = (
  isDirty: boolean,
  options?: UnsavedWarningOptions
) => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const {
    title = 'Unsaved Attendance Changes',
    message = 'You have unsaved attendance marks for this session!\n\nIf you leave now without clicking "Save & Upload Attendance", your unsaved changes will not be committed to the official records.\n\nAre you sure you want to leave without saving?',
    confirmText = 'Discard & Leave',
    cancelText = 'Stay on Page'
  } = options || {};

  // 1. Browser Tab Close, Reload (F5 / Ctrl+R), or External Navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      // Standard browser requirement to show confirmation prompt
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 2. In-App Internal Link Clicks (React Router <Link>, navbar, sidebar, buttons)
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = async (e: MouseEvent) => {
      if (!isDirtyRef.current) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      // Ignore links that open in new window/tab, downloads, or anchor hash links
      if (
        anchor.target === '_blank' ||
        anchor.getAttribute('rel')?.includes('external') ||
        anchor.getAttribute('download') !== null ||
        anchor.getAttribute('href')?.startsWith('#') ||
        anchor.getAttribute('href')?.startsWith('mailto:') ||
        anchor.getAttribute('href')?.startsWith('tel:')
      ) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore if clicking a link to the exact same current path
      const currentPath = window.location.pathname;
      const currentFull = window.location.pathname + window.location.search;
      if (href === currentPath || href === currentFull) return;

      // Intercept and prevent navigation
      e.preventDefault();
      e.stopPropagation();

      const proceed = await confirm({
        title,
        message,
        confirmText,
        cancelText,
        type: 'warning',
        icon: 'warning'
      });

      if (proceed) {
        // Temporarily clear dirty flag so subsequent navigation is not re-intercepted
        isDirtyRef.current = false;
        navigate(href);
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [isDirty, confirm, navigate, title, message, confirmText, cancelText]);

  // 3. Browser Back / Forward Button Handling (popstate)
  useEffect(() => {
    if (!isDirty) return;

    // Push a dummy state so that pressing Back triggers popstate on our page first
    window.history.pushState({ cfsiUnsaved: true }, '', window.location.href);

    const handlePopState = async () => {
      if (!isDirtyRef.current) return;

      const proceed = await confirm({
        title,
        message,
        confirmText,
        cancelText,
        type: 'warning',
        icon: 'warning'
      });

      if (proceed) {
        isDirtyRef.current = false;
        window.history.back();
      } else {
        // Restore history marker to prevent leaving
        window.history.pushState({ cfsiUnsaved: true }, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, confirm, title, message, confirmText, cancelText]);
};
