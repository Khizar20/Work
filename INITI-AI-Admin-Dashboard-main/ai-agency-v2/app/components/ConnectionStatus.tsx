'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../../components/ui/tooltip";
import { Database, Loader2, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { userProfileService } from '../utils/user-profile-service';

/**
 * Component to show comprehensive connection status
 */
export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'warning' | 'error'>('checking');
  const [details, setDetails] = useState<string>('Checking connection...');
  const [showTooltip, setShowTooltip] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    database: boolean;
    authentication: boolean;
    profile: boolean;
    hotel: boolean;
  }>({
    database: false,
    authentication: false,
    profile: false,
    hotel: false
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        setDetails('Checking connection...');

        // Comprehensive connection check
        const result = await userProfileService.checkConnection();
        
        if (result.success && result.user && result.profile) {
          const info = {
            database: true,
            authentication: !!result.user,
            profile: !!result.profile,
            hotel: !!result.profile.hotel_name
          };
          
          setConnectionInfo(info);
          
          if (info.database && info.authentication && info.profile && info.hotel) {
            setStatus('connected');
            setDetails(`Connected to ${result.profile.hotel_name} as ${result.profile.admin_role || result.profile.profile_role}`);
          } else if (info.database && info.authentication && info.profile) {
            setStatus('warning');
            setDetails('Connected but hotel assignment missing');
          } else {
            setStatus('warning');
            setDetails('Partial connection - some features may not work');
          }
        } else {
          setConnectionInfo({
            database: false,
            authentication: false,
            profile: false,
            hotel: false
          });
          setStatus('error');
          setDetails(result.error || 'Connection failed');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionInfo({
          database: false,
          authentication: false,
          profile: false,
          hotel: false
        });
        setStatus('error');
        setDetails('Connection check failed');
      }
    };
    
    // Check connection immediately and then every 30 seconds
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3" />;
      case 'error':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Database className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'connected':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'warning':
        return 'Partial';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };
    return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <Badge 
            className={`cursor-pointer ${getStatusColor()} flex items-center gap-1 px-2 py-1`}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            {getStatusIcon()}
            <span className="text-xs font-medium">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-gray-900 border-gray-700 text-white p-3 max-w-xs"
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="font-semibold text-sm">{details}</div>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span>Database:</span>
                <div className="flex items-center gap-1">
                  {connectionInfo.database ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-400" />
                  )}
                  <span className={connectionInfo.database ? 'text-green-400' : 'text-red-400'}>
                    {connectionInfo.database ? 'Connected' : 'Failed'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <span>Authentication:</span>
                <div className="flex items-center gap-1">
                  {connectionInfo.authentication ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-400" />
                  )}
                  <span className={connectionInfo.authentication ? 'text-green-400' : 'text-red-400'}>
                    {connectionInfo.authentication ? 'Authenticated' : 'Not logged in'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <span>Profile:</span>
                <div className="flex items-center gap-1">
                  {connectionInfo.profile ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-400" />
                  )}
                  <span className={connectionInfo.profile ? 'text-green-400' : 'text-red-400'}>
                    {connectionInfo.profile ? 'Loaded' : 'Missing'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <span>Hotel:</span>
                <div className="flex items-center gap-1">
                  {connectionInfo.hotel ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-orange-400" />
                  )}
                  <span className={connectionInfo.hotel ? 'text-green-400' : 'text-orange-400'}>
                    {connectionInfo.hotel ? 'Assigned' : 'Not assigned'}
                  </span>
                </div>
              </div>
            </div>
            
            {status === 'error' && (
              <div className="text-xs text-red-400 mt-2">
                Click to check connection details
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
