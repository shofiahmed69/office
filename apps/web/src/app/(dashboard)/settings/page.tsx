'use client';

import * as React from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Camera,
  Moon,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { StaggerContainer, StaggerItem } from '@/components/motion';

// Mock user data
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'john.doe@example.com',
  bio: 'Passionate learner focused on machine learning and web development.',
  avatar: null,
  role: 'student',
  joinedAt: '2024-01-01',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <StaggerContainer className="space-y-8 max-w-6xl mx-auto" staggerDelay={0.1}>
      <StaggerItem className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your account, preferences, and notifications.</p>
        </div>
      </StaggerItem>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation for Settings */}
        <StaggerItem className="w-full lg:w-72 flex-shrink-0">
          <Card className="border border-gray-200/80 shadow-sm overflow-hidden sticky top-24">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {[
                  { id: 'profile', icon: User, label: 'Profile' },
                  { id: 'account', icon: Shield, label: 'Account' },
                  { id: 'appearance', icon: Palette, label: 'Appearance' },
                  { id: 'notifications', icon: Bell, label: 'Notifications' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${isActive
                          ? 'bg-teal-50 text-teal-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-teal-500" />}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          <StaggerItem>
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card className="border border-gray-200/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-xl font-bold text-gray-900">Public Profile</CardTitle>
                    <CardDescription>This information will be displayed publicly.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-8 pb-6 border-b border-gray-100">
                      <div className="relative group cursor-pointer">
                        <Avatar size="xl" fallback="JD" className="w-28 h-28 text-3xl border-4 border-white shadow-md ring-1 ring-gray-100" />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{userData.firstName} {userData.lastName}</h3>
                        <p className="text-sm text-gray-500 mb-4">@{userData.username}</p>
                        <div className="flex gap-3 justify-center sm:justify-start">
                          <Button variant="outline" size="sm" className="font-bold border-gray-200 hover:bg-gray-50">Change Avatar</Button>
                          <Button variant="outline" size="sm" className="font-bold border-red-200 text-red-600 hover:bg-red-50">Remove</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="First Name" defaultValue={userData.firstName} className="bg-gray-50/50 focus:bg-white" />
                      <Input label="Last Name" defaultValue={userData.lastName} className="bg-gray-50/50 focus:bg-white" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Username" defaultValue={userData.username} className="bg-gray-50/50 focus:bg-white" />
                      <div>
                        <label className="text-sm font-bold text-gray-900 mb-1.5 block">Role</label>
                        <div className="h-10 flex items-center px-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 text-sm font-medium">
                          Student
                        </div>
                      </div>
                    </div>

                    <Textarea label="Bio" defaultValue={userData.bio} rows={4} className="resize-none bg-gray-50/50 focus:bg-white" />
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" className="font-bold border-gray-200">Cancel</Button>
                  <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800 font-bold shadow-md min-w-[120px]">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <Card className="border border-gray-200/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-xl font-bold text-gray-900">Account Security</CardTitle>
                    <CardDescription>Manage your email and password.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <Input label="Email Address" defaultValue={userData.email} className="bg-gray-50/50 focus:bg-white" />
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4 max-w-md">
                        <Input type="password" placeholder="Current Password" />
                        <Input type="password" placeholder="New Password" />
                        <Input type="password" placeholder="Confirm New Password" />
                        <Button className="bg-teal-600 text-white hover:bg-teal-700 font-bold shadow-sm mt-2">
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-100 bg-red-50/30 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-red-700">Danger Zone</CardTitle>
                    <CardDescription className="text-red-600/80">Irreversible actions.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-red-100">
                      <div>
                        <p className="font-bold text-gray-900">Delete Account</p>
                        <p className="text-sm text-gray-500 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-bold whitespace-nowrap">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'appearance' && (
              <Card className="border border-gray-200/80 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-gray-900">Interface Settings</CardTitle>
                  <CardDescription>Customize your learning environment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <Moon className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Dark Mode</p>
                        <p className="text-sm text-gray-500 font-medium">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <Select options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} className="w-36" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <Globe className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Language</p>
                        <p className="text-sm text-gray-500 font-medium">Select your preferred language</p>
                      </div>
                    </div>
                    <Select options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }]} className="w-36" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="border border-gray-200/80 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-gray-900">Notification Preferences</CardTitle>
                  <CardDescription>Control when and how you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0 p-0 divide-y divide-gray-100">
                  {['Email Notifications', 'Push Notifications', 'Weekly Digest', 'New Buddy Requests'].map((label, i) => (
                    <div key={i} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                      <span className="font-medium text-gray-900">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </StaggerItem>
        </div>
      </div>
    </StaggerContainer>
  );
}
