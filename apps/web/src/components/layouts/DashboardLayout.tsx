'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/auth.store';
import { userService } from '@/services/user.service';

export interface DisplayUser {
  name: string
  email: string
  avatar?: string | null
}

function toDisplayUser(u: {
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  username?: string
  email?: string
  profilePictureUrl?: string | null
  profile_picture_url?: string | null
} | null): DisplayUser | null {
  if (!u) return null
  const first = (u as any).first_name ?? u.firstName ?? ''
  const last = (u as any).last_name ?? u.lastName ?? ''
  const fullName = `${first} ${last}`.trim()
  const name = fullName || u.username || 'User'
  const email = u.email || 'no-email@example.com'
  const avatar = (u as any).profile_picture_url ?? u.profilePictureUrl ?? null
  
  return { name, email, avatar }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [profileFromApi, setProfileFromApi] = React.useState<DisplayUser | null>(null)

  const authUser = useAuthStore(state => state.user)
  const accessToken = useAuthStore(state => state.accessToken)
  const authLogout = useAuthStore(state => state.logout)

  React.useEffect(() => {
    if (!accessToken) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    userService
      .getProfile()
      .then((res: any) => {
        if (cancelled) return
        const userData = res?.data?.user ?? res?.data
        const displayUserData = toDisplayUser(userData)
        setProfileFromApi(displayUserData)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Profile fetch failed:', err)
          setProfileFromApi(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [accessToken])

  const displayUser: DisplayUser | null =
    profileFromApi ?? toDisplayUser(authUser)
  
  const sidebarUser: DisplayUser = displayUser ?? { 
    name: 'Guest User', 
    email: 'Please sign in', 
    avatar: null 
  }

  const handleLogout = () => {
    authLogout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-white z-[100] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
              <span className="text-sm text-gray-500 font-medium">Loading...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Fixed Position */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={sidebarUser}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Sidebar
                isCollapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                user={sidebarUser}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content - Pushed by Sidebar */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10',
          sidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]'
        )}
      >
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          user={displayUser ?? sidebarUser}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 p-6 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
