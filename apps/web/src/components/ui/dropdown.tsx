'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={clsx(
            'absolute top-full mt-2 z-50 min-w-[180px]',
            'bg-white rounded-lg shadow-lg border border-gray-200',
            'animate-slide-down',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export interface DropdownItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  destructive?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  destructive = false,
  children,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'flex items-center gap-3 w-full px-4 py-2 text-sm text-left',
      'transition-colors duration-150',
      destructive
        ? 'text-red-600 hover:bg-red-50'
        : 'text-gray-700 hover:bg-gray-50',
      className
    )}
    {...props}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </button>
);

const DropdownDivider: React.FC = () => (
  <div className="my-1 border-t border-gray-100" />
);

export { Dropdown, DropdownItem, DropdownDivider };
