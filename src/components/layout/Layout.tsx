import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Navbar } from './Navbar';
import { Marquee } from './Marquee';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { ScrollToTop } from '../common/ScrollToTop';
import { isAnyModalInDOM, lockBodyScroll, unlockBodyScroll, resetBodyScrollLock } from '../../lib/scrollLock';

export const Layout: React.FC = () => {
  const location = useLocation();

  // Reset scroll lock whenever changing routes
  useEffect(() => {
    resetBodyScrollLock();
  }, [location.pathname]);

  // Global MutationObserver to automatically lock background scrolling
  // whenever ANY modal, card, popup, or overlay is rendered anywhere in the DOM
  useEffect(() => {
    let wasModalActive = false;

    const evaluateModals = () => {
      const modalActive = isAnyModalInDOM();
      if (modalActive && !wasModalActive) {
        wasModalActive = true;
        lockBodyScroll();
      } else if (!modalActive && wasModalActive) {
        wasModalActive = false;
        unlockBodyScroll();
      }
    };

    evaluateModals();

    const observer = new MutationObserver(() => {
      evaluateModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-hidden'],
    });

    return () => {
      observer.disconnect();
      if (wasModalActive) {
        unlockBodyScroll();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      <ScrollToTop />
      <Topbar />
      <Navbar />
      <Marquee />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};
