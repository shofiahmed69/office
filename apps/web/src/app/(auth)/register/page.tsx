'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User as UserIcon, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

interface PasswordStrengthResult {
  score: number
  label: PasswordStrength
  variant: 'danger' | 'warning' | 'default' | 'success'
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

function getPasswordStrength(password: string): PasswordStrengthResult | null {
  if (!password.length) return null
  const length = password.length >= 8
  const uppercase = /[A-Z]/.test(password)
  const lowercase = /[a-z]/.test(password)
  const number = /[0-9]/.test(password)
  const special = /[^A-Za-z0-9]/.test(password)
  const count = [length, uppercase, lowercase, number, special].filter(Boolean).length
  const levelIndex = Math.min(3, Math.max(0, count - 1))
  const labels: PasswordStrength[] = ['weak', 'fair', 'good', 'strong']
  const variants: PasswordStrengthResult['variant'][] = ['danger', 'warning', 'default', 'success']
  return {
    score: (count / 5) * 100,
    label: labels[levelIndex],
    variant: variants[levelIndex],
    checks: { length, uppercase, lowercase, number, special },
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    const strength = getPasswordStrength(formData.password)
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (strength && strength.label === 'weak') newErrors.password = 'Use a stronger password (add uppercase, numbers, or symbols)'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const username = formData.email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6);
      await authService.register({
        email: formData.email,
        password: formData.password,
        username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      const loginRes: any = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      const data = loginRes?.data ?? loginRes;
      const user = mapApiUserToStore(data?.user);
      const accessToken = data?.tokens?.accessToken ?? data?.accessToken;
      const refreshToken = data?.tokens?.refreshToken ?? data?.refreshToken;
      if (user && accessToken && refreshToken) {
        useAuthStore.getState().login(user, accessToken, refreshToken);
        router.push('/dashboard');
      } else {
        setErrors({ email: 'Registration succeeded. Please sign in.' });
      }
    } catch (err: any) {
      const msg = err?.data?.error ?? err?.message ?? 'Registration failed';
      setErrors({ email: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <span className="font-bold text-2xl text-gray-900">ScholarPass</span>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Start your personalized learning journey today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
                leftIcon={<UserIcon className="w-4 h-4" />}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="w-full">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                hint={!formData.password.length ? 'At least 8 characters' : undefined}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {formData.password.length > 0 && (() => {
                const strength = getPasswordStrength(formData.password)
                if (!strength) return null
                const labelDisplay = strength.label.charAt(0).toUpperCase() + strength.label.slice(1)
                return (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Progress
                        value={strength.score}
                        variant={strength.variant}
                        size="sm"
                        className="flex-1"
                      />
                      <span
                        className={[
                          'text-xs font-medium shrink-0 capitalize',
                          strength.variant === 'danger' && 'text-red-600',
                          strength.variant === 'warning' && 'text-amber-600',
                          strength.variant === 'default' && 'text-teal-600',
                          strength.variant === 'success' && 'text-green-600',
                        ].join(' ')}
                      >
                        {labelDisplay}
                      </span>
                    </div>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      <li className={strength.checks.length ? 'text-green-600' : ''}>
                        {strength.checks.length ? <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : <X className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-300" />}
                        8+ characters
                      </li>
                      <li className={strength.checks.uppercase ? 'text-green-600' : ''}>
                        {strength.checks.uppercase ? <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : <X className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-300" />}
                        Uppercase
                      </li>
                      <li className={strength.checks.lowercase ? 'text-green-600' : ''}>
                        {strength.checks.lowercase ? <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : <X className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-300" />}
                        Lowercase
                      </li>
                      <li className={strength.checks.number ? 'text-green-600' : ''}>
                        {strength.checks.number ? <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : <X className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-300" />}
                        Number
                      </li>
                      <li className={strength.checks.special ? 'text-green-600' : ''}>
                        {strength.checks.special ? <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : <X className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-gray-300" />}
                        Symbol
                      </li>
                    </ul>
                  </div>
                )
              })()}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-teal-600 hover:text-teal-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-teal-600 hover:text-teal-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" type="button">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
