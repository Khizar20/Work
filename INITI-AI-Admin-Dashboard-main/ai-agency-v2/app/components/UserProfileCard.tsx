'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userProfileService, UserProfile, testExport } from '../utils/user-profile-service';
import Link from 'next/link';
import { AlertTriangle, User, Building, MapPin, RefreshCw } from 'lucide-react';

export default function UserProfileCard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: profileError } = await userProfileService.getUserProfile();
      
      if (profileError) {
        setError(profileError);
        setUserProfile(null);
      } else if (data) {
        setUserProfile(data);
      } else {
        setError('No profile data found');
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchUserProfile();
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getMissingFields = (profile: UserProfile) => {
    const missing = [];
    if (!profile.phone) missing.push('Phone');
    if (!profile.location) missing.push('Location');
    if (!profile.department) missing.push('Department');
    if (!profile.hotel_name) missing.push('Hotel Assignment');
    return missing;
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Loading Profile...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-white/10 rounded-full animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-white/10 rounded animate-pulse"></div>
              <div className="h-3 bg-white/10 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userProfile) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Profile Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-900/50 border-red-800 text-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Failed to load user profile data'}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              className="bg-red-700 hover:bg-red-600 text-white"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry ({retryCount})
            </Button>
            
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Setup Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const missingFields = getMissingFields(userProfile);
  const completionPercentage = Math.round(((6 - missingFields.length) / 6) * 100);

  return (
    <Card className="bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </div>
          <Badge 
            variant={completionPercentage === 100 ? "default" : "secondary"}
            className={completionPercentage === 100 ? "bg-green-700" : "bg-orange-700"}
          >
            {completionPercentage}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarImage src={userProfile.avatar_url ?? undefined} alt={userProfile.name} />
            <AvatarFallback className="bg-violet-700 text-white text-lg font-semibold">
              {getInitials(userProfile.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <h3 className="text-xl font-semibold text-white">{userProfile.name}</h3>
            <p className="text-white/70">{userProfile.user_email}</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-700 text-white">
                {userProfile.admin_role || userProfile.profile_role || 'User'}
              </Badge>
              {userProfile.admin_role && (
                <Badge variant="outline" className="border-white/30 text-white/70">
                  Hotel Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Hotel Info */}
        {userProfile.hotel_name && (
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
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
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {userProfile.department && (
            <div className="text-white/70">
              <span className="font-medium">Department:</span>
              <br />
              <span className="text-white">{userProfile.department}</span>
            </div>
          )}
          
          {userProfile.location && (
            <div className="text-white/70">
              <span className="font-medium">Location:</span>
              <br />
              <span className="text-white">{userProfile.location}</span>
            </div>
          )}
          
          <div className="text-white/70">
            <span className="font-medium">Member Since:</span>
            <br />
            <span className="text-white">{formatDate(userProfile.user_created_at)}</span>
          </div>
          
          {userProfile.last_login && (
            <div className="text-white/70">
              <span className="font-medium">Last Login:</span>
              <br />
              <span className="text-white">{formatDate(userProfile.last_login)}</span>
            </div>
          )}
        </div>

        {/* Missing Fields Alert */}
        {missingFields.length > 0 && (
          <Alert className="bg-orange-900/30 border-orange-800/50">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              Complete your profile: {missingFields.join(', ')} missing
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Link href="/profile" className="block">
          <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
            {missingFields.length > 0 ? 'Complete Profile' : 'Manage Profile'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}