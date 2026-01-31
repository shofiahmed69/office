'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  className,
  style,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    className={clsx(
      'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
      circle ? 'rounded-full' : 'rounded-lg',
      className
    )}
    style={{
      width: width || '100%',
      height: height || '1rem',
      ...style,
    }}
    {...props}
  />
);

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-xl border border-gray-100 p-6', className)}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton circle width={48} height={48} />
      <div className="flex-1">
        <Skeleton height={16} width="60%" className="mb-2" />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
    <Skeleton height={12} className="mb-2" />
    <Skeleton height={12} width="80%" className="mb-4" />
    <div className="flex gap-2">
      <Skeleton height={24} width={60} />
      <Skeleton height={24} width={60} />
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton height={16} width={i === 0 ? '70%' : i === columns - 1 ? 40 : '50%'} />
      </td>
    ))}
  </tr>
);

// Stats card skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton height={12} width={80} className="mb-2" />
        <Skeleton height={28} width={60} />
      </div>
      <Skeleton circle width={48} height={48} />
    </div>
  </div>
);

// List item skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
    <Skeleton circle width={40} height={40} />
    <div className="flex-1">
      <Skeleton height={14} width="50%" className="mb-2" />
      <Skeleton height={12} width="30%" />
    </div>
    <Skeleton height={32} width={80} />
  </div>
);

// Content card skeleton
export const ContentCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <Skeleton height={160} className="rounded-none" />
    <div className="p-4">
      <div className="flex gap-2 mb-3">
        <Skeleton height={20} width={50} />
        <Skeleton height={20} width={70} />
      </div>
      <Skeleton height={18} className="mb-2" />
      <Skeleton height={14} width="80%" className="mb-3" />
      <div className="flex justify-between">
        <Skeleton height={12} width={60} />
        <Skeleton height={12} width={40} />
      </div>
    </div>
  </div>
);

// Video card skeleton (topic / discover grid)
export const VideoCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('rounded-xl border border-gray-200 overflow-hidden bg-gray-50', className)}>
    <Skeleton className="aspect-video w-full rounded-none" />
    <div className="p-3">
      <Skeleton height={14} width="90%" className="mb-2" />
      <Skeleton height={14} width="70%" className="mb-2" />
      <Skeleton height={12} width={40} />
    </div>
  </div>
);
