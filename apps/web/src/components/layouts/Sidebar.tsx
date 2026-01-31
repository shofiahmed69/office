'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardCheck,
  Map,
  Library,
  Users,
  Video,
  Bot,
  BarChart3,
  Settings,
  ChevronLeft,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assessment', href: '/assessment', icon: ClipboardCheck },
  { label: 'Learning Roadmap', href: '/roadmap', icon: Map },
  { label: 'Content Library', href: '/content', icon: Library },
  { label: 'Study Buddies', href: '/buddies', icon: Users, badge: '2' },
  { label: 'Study Sessions', href: '/sessions', icon: Video },
  { label: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'New' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, user }) => {
  const pathname = usePathname();

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }, // Slightly wider collapsed state for better icon spacing
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const Icon = item.icon;

    return (
      <li className="relative px-3">
        <Link href={item.href} className="block outline-none">
          <motion.div
            className={clsx(
              'flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer relative z-10',
              isActive ? 'text-teal-700 font-medium' : 'text-gray-500 hover:text-gray-900'
            )}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-teal-50/80 rounded-xl -z-10 border border-teal-100/50"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <Icon className={clsx('w-5 h-5 flex-shrink-0 relative z-10 transition-colors', isActive ? 'text-teal-600' : 'text-current')} />
            
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="truncate flex-1 text-sm relative z-10"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isCollapsed && item.badge && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={clsx(
                    'px-2 py-0.5 text-[10px] font-bold rounded-full relative z-10 shadow-sm',
                    item.badge === 'New' 
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                      : 'bg-white text-gray-600 border border-gray-100'
                  )}
                >
                  {item.badge}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </li>
    );
  };

  return (
    <motion.aside 
      className="h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/60 flex flex-col z-40 shadow-xl shadow-gray-100/50"
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center gap-2 px-4 border-b border-gray-100/60 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden group">
          <motion.div 
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex-shrink-0 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow"
            whileHover={{ rotate: 10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 truncate tracking-tight min-w-0"
              >
                ScholarPass
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <motion.button
          onClick={onToggle}
          type="button"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1 scrollbar-thin">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100/60 bg-white/50 backdrop-blur-sm">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-br from-teal-900 via-teal-900/95 to-teal-800 rounded-2xl shadow-xl shadow-teal-900/20 text-white relative overflow-hidden group cursor-pointer border-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-28 h-28 bg-teal-400/15 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-teal-400/25 transition-colors duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-white/15 rounded-lg backdrop-blur-sm border border-white/10">
                      <Sparkles className="w-4 h-4 text-teal-200" />
                    </div>
                    <span className="font-bold text-sm tracking-wide text-white">Upgrade to Pro</span>
                  </div>
                  <p className="text-xs text-teal-100/90 mb-4 leading-relaxed font-medium">
                    Unlock AI tutor, unlimited practice, and premium content.
                  </p>
                  <button className="w-full py-2.5 bg-white text-teal-900 text-xs font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.02] duration-200">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className="space-y-1 mb-4">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </ul>

        {user && (
          <Link href={user.email === 'Please sign in' ? '/login' : '/settings'}>
            <motion.div 
              className={clsx(
                'flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-md transition-all cursor-pointer group',
                isCollapsed && 'justify-center'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Avatar src={user.avatar || undefined} fallback={user.name} size="sm" className="ring-2 ring-white shadow-sm w-9 h-9" />
                {!isCollapsed && user.email !== 'Please sign in' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white border border-white" />
                )}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-700 transition-colors">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate font-medium">{user.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        )}
      </div>
    </motion.aside>
  );
};
