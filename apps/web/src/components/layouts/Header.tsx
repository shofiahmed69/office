'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Bell, Search, Menu, LogOut, User, Settings, Command } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/dropdown';

interface HeaderProps {
  onMenuClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, user, onLogout }) => {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [hasNotifications] = React.useState(true);

  return (
    <motion.header
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <motion.button
              onClick={onMenuClick}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}
          
          {/* Search */}
          <motion.div
            className={clsx(
              "hidden md:flex items-center relative rounded-xl transition-all duration-300",
              isSearchFocused ? "bg-white shadow-lg ring-2 ring-teal-500/20" : "bg-gray-50 hover:bg-gray-100"
            )}
            animate={{ width: isSearchFocused ? 320 : 260 }}
          >
            <Search className={clsx("absolute left-3 w-4 h-4 transition-colors", isSearchFocused ? "text-teal-600" : "text-gray-400")} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-12 bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="absolute right-3 flex items-center pointer-events-none">
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium text-gray-400 shadow-sm">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search mobile */}
          <motion.button
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="w-5 h-5" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {hasNotifications && (
                <>
                  <motion.span
                    className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                  <motion.span
                    className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                  />
                </>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          {/* User Menu */}
          {user && (
            <Dropdown
              trigger={
                <motion.button
                  className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <Avatar src={user.avatar} fallback={user.name} size="sm" className="ring-2 ring-white shadow-sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-[10px] font-medium text-teal-600">Pro Member</p>
                  </div>
                </motion.button>
              }
            >
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="p-1">
                <DropdownItem icon={<User className="w-4 h-4" />}>
                  Profile
                </DropdownItem>
                <DropdownItem icon={<Settings className="w-4 h-4" />}>
                  Settings
                </DropdownItem>
              </div>
              <DropdownDivider />
              <div className="p-1">
                <DropdownItem
                  icon={<LogOut className="w-4 h-4" />}
                  destructive
                  onClick={onLogout}
                >
                  Sign out
                </DropdownItem>
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </motion.header>
  );
};
