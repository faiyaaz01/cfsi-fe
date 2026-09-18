import React from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Navbar } from './Navbar';
import { Marquee } from './Marquee';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { ScrollToTop } from '../common/ScrollToTop';

export const Layout: React.FC = () => {
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
