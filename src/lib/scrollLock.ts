/**
 * Central Fire Safety Institute (CFSI) - Universal Body Scroll Lock Manager
 * Prevents the background page from scrolling whenever any modal, card,
 * popup, or overlay is open in the application.
 *
 * Supports reference counting so stacked modals (e.g. Confirm over Edit)
 * keep the background locked until ALL modals are closed.
 */

let lockCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalPaddingRight = '';

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;

  if (lockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    // Prevent horizontal content shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('overflow-hidden');
    document.documentElement.classList.add('overflow-hidden');
  }

  lockCount++;
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalPaddingRight;
    document.body.classList.remove('overflow-hidden');
    document.documentElement.classList.remove('overflow-hidden');
  }
}

/**
 * Force resets any active scroll locks (used on route changes).
 */
export function resetBodyScrollLock(): void {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  document.body.style.overflow = originalBodyOverflow || '';
  document.documentElement.style.overflow = originalHtmlOverflow || '';
  document.body.style.paddingRight = originalPaddingRight || '';
  document.body.classList.remove('overflow-hidden');
  document.documentElement.classList.remove('overflow-hidden');
}

/**
 * Checks if any modal, popup, card overlay, or dialog is currently present in the DOM.
 */
export function isAnyModalInDOM(): boolean {
  if (typeof document === 'undefined') return false;

  // Search for active modal overlays, dialogs, popups, or backdrops
  const modalElements = document.querySelectorAll(
    '.fixed.inset-0:not(.pointer-events-none):not([aria-hidden="true"]), [role="dialog"], [role="alertdialog"], [aria-modal="true"]'
  );

  for (let i = 0; i < modalElements.length; i++) {
    const el = modalElements[i] as HTMLElement;
    // Exclude root container or hidden elements
    if (el.id === 'root' || el.style.display === 'none' || el.classList.contains('hidden')) {
      continue;
    }
    // Verify it is actually displayed and taking space
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return true;
    }
  }

  return false;
}
