'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}
    {...props}
  >
    {icon && (
      <div className="mb-4 p-4 bg-gray-100 rounded-full text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    {description && (
      <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
    )}
    {action && (
      <Button onClick={action.onClick} className="mt-4">
        {action.label}
      </Button>
    )}
  </div>
);

export { EmptyState };
