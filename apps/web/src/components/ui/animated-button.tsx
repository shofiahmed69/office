'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  glow?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  glow = false,
  ...props
}) => {
  const baseStyles = clsx(
    'relative inline-flex items-center justify-center gap-2 font-semibold',
    'rounded-xl transition-colors overflow-hidden',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50'
  );

  const variants = {
    primary: clsx(
      'bg-teal-600 text-white',
      'hover:bg-teal-700',
      'focus-visible:ring-teal-500'
    ),
    secondary: clsx(
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200',
      'focus-visible:ring-gray-500'
    ),
    outline: clsx(
      'border-2 border-gray-200 bg-transparent text-gray-700',
      'hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50',
      'focus-visible:ring-teal-500'
    ),
    ghost: clsx(
      'text-gray-600 bg-transparent',
      'hover:bg-gray-100 hover:text-gray-900',
      'focus-visible:ring-gray-500'
    ),
    danger: clsx(
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus-visible:ring-red-500'
    ),
    success: clsx(
      'bg-green-600 text-white',
      'hover:bg-green-700',
      'focus-visible:ring-green-500'
    ),
    gradient: clsx(
      'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
      'hover:from-teal-600 hover:to-cyan-600',
      'focus-visible:ring-teal-500'
    ),
  };

  const sizes = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg',
  };

  return (
    <motion.button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        glow && variant === 'primary' && 'shadow-[0_0_20px_rgba(20,184,166,0.4)]',
        glow && variant === 'gradient' && 'shadow-[0_0_25px_rgba(20,184,166,0.5)]',
        className
      )}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Shine effect */}
      {(variant === 'primary' || variant === 'gradient') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
      
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : leftIcon}
      <span className="relative">{children}</span>
      {!isLoading && rightIcon}
    </motion.button>
  );
};
