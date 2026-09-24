import React from 'react';

export interface BrandLoaderProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen' | 'page' | 'card' | 'inline';
  className?: string;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  message = 'Loading...',
  submessage,
  size = 'md',
  className = '',
}) => {
  // Inline simple loader
  if (size === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        {message && (
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {message}
          </span>
        )}
      </div>
    );
  }

  const isFullscreen = size === 'fullscreen';
  const isPage = size === 'page';
  const isCard = size === 'card';
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const spinnerSize = isSmall
    ? 'w-6 h-6 border-2'
    : isLarge
    ? 'w-12 h-12 border-[3.5px]'
    : 'w-9 h-9 border-[3px]';

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-4 gap-3 ${className}`}>
      {/* Clean, minimal circular spinner */}
      <div
        className={`${spinnerSize} rounded-full border-gray-200 dark:border-white/10 border-t-primary animate-spin shrink-0`}
      />

      {/* Clean text */}
      {message && (
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {message}
          </p>
          {submessage && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {submessage}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-[#0d1117]/85 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  if (isPage) {
    return (
      <div className="min-h-[50vh] flex-1 flex items-center justify-center w-full py-12">
        {content}
      </div>
    );
  }

  if (isCard) {
    return (
      <div className="py-8 flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};
