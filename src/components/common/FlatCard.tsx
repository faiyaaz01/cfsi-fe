import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface FlatCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const FlatCard: React.FC<FlatCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...rest
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.25, ease: 'easeOut' } } : undefined}
      className={`rounded-xl bg-white dark:bg-[#161d27] border border-gray-100 dark:border-white/5 shadow-md hover:shadow-xl transition-shadow duration-300 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
