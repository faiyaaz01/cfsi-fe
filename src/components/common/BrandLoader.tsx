import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';

export interface BrandLoaderProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen' | 'page' | 'card' | 'inline';
  className?: string;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  message = 'Loading Central Fire Safety Institute...',
  submessage = 'Government Recognized • Vadodara Campus',
  size = 'md',
  className = '',
}) => {
  // Inline miniature loader
  if (size === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary/5 dark:bg-white/5 border border-primary/15 dark:border-white/10 ${className}`}>
        <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <Flame className="w-2.5 h-2.5 text-accent animate-pulse" />
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {message}
        </span>
      </div>
    );
  }

  const isFullscreen = size === 'fullscreen';
  const isPage = size === 'page';
  const isCard = size === 'card';
  const isSmall = size === 'sm';

  const emblemSize = isSmall ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20';
  const coreSize = isSmall ? 'w-9 h-9' : 'w-12 h-12 sm:w-14 sm:h-14';
  const iconSize = isSmall ? 'w-4 h-4' : 'w-6 h-6 sm:w-7 sm:h-7';
  const flameSize = isSmall ? 'w-2.5 h-2.5 top-0.5 right-0.5' : 'w-3.5 h-3.5 top-1 right-1';
  const barWidth = isSmall ? 'w-28' : 'w-40 sm:w-52';

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 space-y-4 ${className}`}>
      {/* Animated Fire & Safety Emblem */}
      <div className={`relative ${emblemSize} flex items-center justify-center`}>
        {/* Ambient pulsing fire/primary aura */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/30 to-accent/30 dark:from-primary/40 dark:to-accent/40 blur-xl animate-pulse" />
        
        {/* Dual-color rotating spinner ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 border-t-primary border-r-accent dark:border-white/10 dark:border-t-primary dark:border-r-accent animate-spin" />

        {/* Counter-rotating subtle dash ring */}
        <div className="absolute -inset-1.5 rounded-3xl border border-dashed border-accent/30 dark:border-accent/20 animate-[spin_10s_linear_infinite_reverse]" />
        
        {/* Core institute shield emblem */}
        <div className={`relative ${coreSize} rounded-xl bg-gradient-to-tr from-primary via-[#286ee6] to-accent flex items-center justify-center text-white shadow-lg shadow-primary/25`}>
          <ShieldCheck className={iconSize} />
          <Flame className={`${flameSize} text-accent-light absolute animate-bounce`} />
        </div>
      </div>

      {/* Message and submessage */}
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

      {/* Shimmering animated progress bar */}
      <div className={`${barWidth} h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden relative shadow-inner`}>
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-[marquee_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 dark:bg-[#0d1117]/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  if (isPage) {
    return (
      <div className="min-h-[55vh] flex-1 flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  if (isCard) {
    return (
      <div className="py-12 flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};
