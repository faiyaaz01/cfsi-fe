import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface PageLoaderProps {
  isLoading?: boolean;
}

/**
 * Top-of-screen slim animated progress line (NProgress style).
 * Triggers a sleek glowing progress animation on route navigation or network fetch.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger on route changes
  useEffect(() => {
    setActive(true);
    setProgress(25);

    const t1 = setTimeout(() => setProgress(65), 100);
    const t2 = setTimeout(() => setProgress(90), 250);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, location.search]);

  // Also support manual isLoading prop
  useEffect(() => {
    if (isLoading) {
      setActive(true);
      setProgress(75);
    } else if (active) {
      setProgress(100);
      const timer = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!active && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10000] h-1 pointer-events-none overflow-hidden bg-transparent"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-fire-red shadow-[0_0_12px_rgba(255,122,41,0.6)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
};
