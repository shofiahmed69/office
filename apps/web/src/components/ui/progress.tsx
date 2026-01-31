'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  label?: string;
  /** Applied to the inner progress bar (indicator), not the root div */
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (props, ref) => {
    const {
      className = '',
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showValue = false,
      label,
      indicatorClassName,
      ...rest
    } = props
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    const variants = {
      default: 'bg-teal-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
    };

    return (
      <div ref={ref} className={clsx('w-full', className)} {...rest}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1.5">
            {label && (
              <span className="text-sm font-medium text-gray-700">{label}</span>
            )}
            {showValue && (
              <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500 ease-out',
              variants[variant],
              indicatorClassName
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
