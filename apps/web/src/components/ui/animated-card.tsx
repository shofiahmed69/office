'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

export interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient' | 'glass';
  hover?: 'lift' | 'glow' | 'border' | 'scale' | 'none';
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  className = '',
  variant = 'default',
  hover = 'lift',
  delay = 0,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg shadow-gray-100',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100',
    glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg',
  };

  const hoverVariants = {
    lift: {
      rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      hover: { y: -6, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)' },
    },
    glow: {
      rest: { boxShadow: '0 0 0 rgba(20,184,166,0)' },
      hover: { boxShadow: '0 0 30px rgba(20,184,166,0.3)' },
    },
    border: {
      rest: { borderColor: '#e5e7eb' },
      hover: { borderColor: '#14b8a6' },
    },
    scale: {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
    },
    none: {
      rest: {},
      hover: {},
    },
  };

  return (
    <motion.div
      className={clsx('rounded-2xl overflow-hidden', variants[variant], className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      variants={hoverVariants[hover]}
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated card content wrapper
export const AnimatedCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx('p-6', className)}>{children}</div>
);

// Animated card with gradient border
export const GradientBorderCard: React.FC<HTMLMotionProps<'div'> & { delay?: number }> = ({
  children,
  className,
  delay = 0,
  ...props
}) => (
  <motion.div
    className="relative p-[2px] rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.01 }}
    {...props}
  >
    <div className={clsx('bg-white rounded-2xl h-full', className)}>
      {children}
    </div>
  </motion.div>
);
