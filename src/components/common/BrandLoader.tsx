import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';

export interface BrandLoaderProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  message = 'Loading Central Fire Safety Institute...',
  submessage = 'Connecting to real-time records server',
  size = 'md',
  className = '',
}) => {
  const isFullscreen = size === 'fullscreen';

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 space-y-4 ${className}`}>
      {/* Animated Emblem */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        {/* Glowing pulsing outer ring */}
        <div className="absolute inset-0 rounded-3xl bg-primary/20 dark:bg-primary/30 blur-xl animate-pulse" />
        
        {/* Rotating outer spinner ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 border-t-primary dark:border-white/10 dark:border-t-primary animate-spin" />
        
        {/* Core emblem container */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-tr from-primary via-primary-light to-accent flex items-center justify-center text-white shadow-lg shadow-primary/25">
          <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          <Flame className="w-3.5 h-3.5 text-accent absolute top-1 right-1 animate-bounce" />
        </div>
      </div>

      {/* Message and animated progress indicator */}
      <div className="space-y-1.5 max-w-sm">
        <h4 className="font-heading font-black text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
          {message}
        </h4>
        {submessage && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {submessage}
          </p>
        )}
      </div>

      {/* Shimmering miniature progress bar */}
      <div className="w-36 sm:w-48 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-[marquee_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#0d1117]/85 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
