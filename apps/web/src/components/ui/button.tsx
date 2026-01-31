'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** When true, render the single child with button styles merged (e.g. Link as child) */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    const baseStyles = clsx(
      'inline-flex items-center justify-center gap-2 font-medium',
      'rounded-lg transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50'
    );
    
    const variants = {
      primary: clsx(
        'bg-teal-600 text-white',
        'hover:bg-teal-700 active:bg-teal-800',
        'focus-visible:ring-teal-500'
      ),
      secondary: clsx(
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200 active:bg-gray-300',
        'focus-visible:ring-gray-500'
      ),
      outline: clsx(
        'border-2 border-gray-200 bg-white text-gray-700',
        'hover:border-teal-500 hover:text-teal-600',
        'focus-visible:ring-teal-500'
      ),
      ghost: clsx(
        'text-gray-600 bg-transparent',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus-visible:ring-gray-500'
      ),
      danger: clsx(
        'bg-red-600 text-white',
        'hover:bg-red-700 active:bg-red-800',
        'focus-visible:ring-red-500'
      ),
      success: clsx(
        'bg-green-600 text-white',
        'hover:bg-green-700 active:bg-green-800',
        'focus-visible:ring-green-500'
      ),
    };
    
    const sizes = {
      xs: 'h-7 px-2.5 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    const mergedClassName = clsx(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
        className: clsx(mergedClassName, (children.props as { className?: string }).className),
        ref,
      });
    }

    return (
      <button
        ref={ref}
        className={mergedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
