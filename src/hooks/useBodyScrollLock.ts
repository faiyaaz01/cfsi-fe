import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../lib/scrollLock';

/**
 * Universal hook to lock background page scrolling when a modal, card, or popup is visible.
 * Restores scrolling automatically when closed or unmounted.
 *
 * @param isLocked - true when the modal/popup/overlay is active
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
