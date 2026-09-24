import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'accent' | 'white' | 'muted';
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-[2.5px]',
  xl: 'w-10 h-10 border-3',
};

const variantClasses = {
  primary: 'border-primary/25 border-t-primary dark:border-primary/30 dark:border-t-primary-light',
  accent: 'border-accent/25 border-t-accent',
  white: 'border-white/25 border-t-white',
  muted: 'border-gray-300 border-t-gray-700 dark:border-white/20 dark:border-t-white',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  label,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <div
        className={`rounded-full animate-spin shrink-0 ${sizeClasses[size]} ${variantClasses[variant]}`}
      />
      {label && (
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
