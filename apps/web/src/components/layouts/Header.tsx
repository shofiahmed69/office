'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          ScholarPass
        </Link>
        
        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-slate-700 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/roadmap" className="text-slate-700 hover:text-slate-900">
                My Roadmap
              </Link>
              <Link href="/study-buddies" className="text-slate-700 hover:text-slate-900">
                Study Buddies
              </Link>
              <span className="text-sm text-slate-600">
                {user?.firstName}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
