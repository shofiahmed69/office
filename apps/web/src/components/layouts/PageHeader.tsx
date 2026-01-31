'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={clsx('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 text-xs sm:text-sm mb-3 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-teal-600 transition-colors truncate max-w-[140px] sm:max-w-none"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-none">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-sm sm:text-base text-gray-500 line-clamp-2 sm:line-clamp-none">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
