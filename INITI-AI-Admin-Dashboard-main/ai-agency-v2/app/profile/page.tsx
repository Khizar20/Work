'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '../components/DashboardLayout';
import { userProfileService, UserProfile, ProfileUpdateData, HotelAdminUpdateData } from '../utils/user-profile-service';
import { User, Building, MapPin, Phone, Calendar, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileUpdateData>({});
  const [adminForm, setAdminForm] = useState<HotelAdminUpdateData>({});

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: profileError } = await userProfileService.getUserProfile();
      
      if (profileError) {
        setError(profileError);
      } else if (data) {
        setUserProfile(data);
        // Initialize form with current data
        setProfileForm({
          name: data.name,
          phone: data.phone || '',
          location: data.location || '',
          department: data.department || '',
          timezone: data.timezone || 'UTC',
          skills: data.skills || []
        });
        setAdminForm({
          fullname: data.admin_fullname || data.name,
          role: data.admin_role as 'admin' | 'manager' | 'support' || 'admin'
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    
    setSaving(true);
    
    try {
      // Update profile
      const { success: profileSuccess, error: profileError } = await userProfileService.updateProfile(profileForm);
      
      if (!profileSuccess) {
        throw new Error(profileError || 'Failed to update profile');
      }
      
      // Update hotel admin info
      const { success: adminSuccess, error: adminError } = await userProfileService.updateHotelAdmin(adminForm);
      
      if (!adminSuccess) {
        throw new Error(adminError || 'Failed to update admin info');
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh the profile data
      await fetchProfile();
      
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Failed to save profile changes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
          </div>
          
          <Card className="bg-black/50 backdrop-blur-sm border-white/10">
            <CardContent className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-white/10 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
          </div>
          
          <Alert className="bg-red-900/50 border-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-white">
              {error || 'Failed to load profile data'}
            </AlertDescription>
          </Alert>
          
          <Button onClick={fetchProfile} className="bg-violet-700 hover:bg-violet-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              <p className="text-white/70">Manage your account settings and preferences</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-black/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 border-4 border-white/20">
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.name} />
                    <AvatarFallback className="bg-violet-700 text-white text-2xl font-semibold">
                      {getInitials(userProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-white">{userProfile.name}</h3>
                    <p className="text-white/70">{userProfile.user_email}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge className="bg-violet-700 text-white">
                        {userProfile.admin_role || userProfile.profile_role}
                      </Badge>
                      {userProfile.admin_role && (
                        <Badge variant="outline" className="border-white/30 text-white/70">
                          Hotel Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {formatDate(userProfile.user_created_at)}</span>
                  </div>
                  
                  {userProfile.last_login && (
                    <div className="flex items-center gap-2 text-white/70">
                      <CheckCircle className="h-4 w-4" />
                      <span>Last login {formatDate(userProfile.last_login)}</span>
                    </div>
                  )}
                </div>

                {userProfile.hotel_name && (
                  <>
                    <Separator className="bg-white/10" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{userProfile.hotel_name}</span>
                      </div>
                      {userProfile.hotel_city && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{userProfile.hotel_city}, {userProfile.hotel_country}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-black/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-white">Location</Label>
                    <Input
                      id="location"
                      value={profileForm.location || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your location"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department" className="text-white">Department</Label>
                    <Input
                      id="department"
                      value={profileForm.department || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your department"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Admin Information */}
            {userProfile.admin_id && (
              <Card className="bg-black/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Hotel Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin-fullname" className="text-white">Admin Display Name</Label>
                      <Input
                        id="admin-fullname"
                        value={adminForm.fullname || ''}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, fullname: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Enter admin display name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="admin-role" className="text-white">Admin Role</Label>
                      <select
                        id="admin-role"
                        value={adminForm.role || 'admin'}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'support' }))}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2"
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
