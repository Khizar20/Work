'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../utils/auth';

export default function UserSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [notificationsUpdated, setNotificationsUpdated] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // In a real app, we'd load user data from Supabase
    if (user) {
      // Initialize with user email
      setEmail(user.email || '');
      
      // Mock other data
      setName('John Smith');
      setJobTitle('Hotel Manager');
      setPhoneNumber('555-123-4567');
    }
  }, [user]);

  // Mock update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdated(false);
    setProfileError('');
    
    // In a real app, we'd update the user profile in Supabase
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Success
      setProfileUpdated(true);
    } catch (error) {
      setProfileError('Failed to update profile');
      console.error(error);
    }
  };
  
  // Mock change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdated(false);
    setPasswordError('');
    
    // Simple validation
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    // In a real app, we'd update the password in Supabase
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear password fields and show success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordUpdated(true);
    } catch (error) {
      setPasswordError('Failed to update password');
      console.error(error);
    }
  };
  
  // Mock update notifications
  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationsUpdated(false);
    
    // In a real app, we'd update notification preferences in Supabase
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Success
      setNotificationsUpdated(true);
    } catch (error) {
      console.error(error);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  if (!mounted || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">User Settings</h1>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              {profileUpdated && (
                <div className="bg-green-50 text-green-700 p-4 mb-4 rounded-md">
                  Profile successfully updated!
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-md">
                  {profileError}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-500">
                      Contact support to change your email address
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input 
                      id="job-title" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Hotel Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="555-123-4567"
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-4">
                  Save Changes
                </Button>
              </form>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
              <p className="text-gray-500 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Log Out
              </Button>
              <Button 
                variant="outline" 
                className="ml-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </Card>
          </TabsContent>
          
          {/* Password Tab */}
          <TabsContent value="password" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Update Password</h2>
              {passwordUpdated && (
                <div className="bg-green-50 text-green-700 p-4 mb-4 rounded-md">
                  Password successfully updated!
                </div>
              )}
              {passwordError && (
                <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-md">
                  {passwordError}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">
                  Update Password
                </Button>
              </form>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              {notificationsUpdated && (
                <div className="bg-green-50 text-green-700 p-4 mb-4 rounded-md">
                  Notification preferences updated!
                </div>
              )}
              <form onSubmit={handleUpdateNotifications} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={(checked) => 
                        setEmailNotifications(checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for bookings, maintenance requests, and system alerts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sms-notifications" 
                      checked={smsNotifications}
                      onCheckedChange={(checked) => 
                        setSmsNotifications(checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="sms-notifications">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive text message alerts for urgent matters.
                      </p>
                    </div>
                  </div>
                </div>
                <Button type="submit">
                  Save Preferences
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}