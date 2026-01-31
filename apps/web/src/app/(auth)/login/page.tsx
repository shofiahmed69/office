'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/ui/animated-button';
import { FadeInUp } from '@/components/motion';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/stores/auth.store';

function mapApiUserToStore(u: any): User {
  return {
    id: u.id,
    username: u.username ?? '',
    email: u.email ?? '',
    firstName: u.first_name ?? u.firstName ?? '',
    lastName: u.last_name ?? u.lastName ?? '',
    profilePictureUrl: u.profile_picture_url ?? u.profilePictureUrl ?? null,
    role: u.role_name ?? u.role ?? 'user',
  };
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await authService.login({ email: formData.email, password: formData.password });
      const data = res?.data ?? res;
      const user = mapApiUserToStore(data?.user);
      const accessToken = data?.tokens?.accessToken ?? data?.accessToken;
      const refreshToken = data?.tokens?.refreshToken ?? data?.refreshToken;
      if (user && accessToken && refreshToken) {
        login(user, accessToken, refreshToken);
        router.push('/dashboard');
      } else {
        setErrors({ email: 'Invalid response from server' });
      }
    } catch (err: any) {
      const msg = err?.data?.error ?? err?.message ?? 'Login failed';
      setErrors({ email: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Logo */}
      <FadeInUp className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <motion.div
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/30"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <GraduationCap className="w-7 h-7 text-white" />
        </motion.div>
        <span className="font-bold text-2xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          ScholarPass
        </span>
      </FadeInUp>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl shadow-gray-200/50 backdrop-blur-sm bg-white/80">
          <CardHeader className="text-center pb-2">
            <FadeInUp delay={0.1}>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            </FadeInUp>
            <FadeInUp delay={0.15}>
              <CardDescription className="text-gray-500">
                Sign in to continue your learning journey
              </CardDescription>
            </FadeInUp>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <FadeInUp delay={0.2}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  leftIcon={<Mail className="w-4 h-4" />}
                  className="h-12"
                />
              </FadeInUp>

              <FadeInUp delay={0.25}>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    leftIcon={<Lock className="w-4 h-4" />}
                    className="h-12"
                    rightIcon={
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    }
                  />
                </div>
              </FadeInUp>

              <FadeInUp delay={0.3}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.35}>
                <AnimatedButton
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  glow
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </AnimatedButton>
              </FadeInUp>
            </form>

            <FadeInUp delay={0.4}>
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { name: 'Google', icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )},
                    { name: 'GitHub', icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )},
                  ].map((provider) => (
                    <motion.button
                      key={provider.name}
                      type="button"
                      className="flex items-center justify-center gap-2 h-12 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {provider.icon}
                      {provider.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.45}>
              <p className="mt-8 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                  Sign up for free
                </Link>
              </p>
            </FadeInUp>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
