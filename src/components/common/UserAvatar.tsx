import React, { useState } from 'react';
import { User } from 'lucide-react';
import cfsiLogo from '../../assets/cfsi-logo.jpg';

interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  useLogo?: boolean;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 sm:w-20 sm:h-20 text-xl font-bold',
  xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl font-bold'
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  name = '',
  role,
  size = 'md',
  className = '',
  useLogo = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Filter out demo photos (e.g. unsplash or placeholder urls)
  const isDemoOrInvalid = !photoUrl || 
    photoUrl.includes('unsplash.com') || 
    photoUrl.includes('placeholder') || 
    photoUrl.includes('demo') ||
    imageError;

  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : '';
  const shouldShowLogo = useLogo || role === 'admin' || (!photoUrl && !initial);

  const containerSizeClass = sizeClasses[size] || sizeClasses.md;
  const iconSizeClass = iconSizes[size] || iconSizes.md;

  if (!isDemoOrInvalid && photoUrl) {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 ${containerSizeClass} ${className}`}>
        <img
          src={photoUrl}
          alt={name || 'User Profile'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (shouldShowLogo) {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 p-0.5 bg-white border border-primary/20 shadow-xs flex items-center justify-center ${containerSizeClass} ${className}`}>
        <img
          src={cfsiLogo}
          alt="CFSI"
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-primary to-[#2b6be3] text-white font-bold flex items-center justify-center shadow-xs ${containerSizeClass} ${className}`}>
      {initial ? (
        <span>{initial}</span>
      ) : (
        <User className={iconSizeClass} />
      )}
    </div>
  );
};
