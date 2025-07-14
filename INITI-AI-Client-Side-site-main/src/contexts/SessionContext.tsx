'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SessionParams, getSessionParams } from '@/utils/session';

interface SessionContextType {
  sessionParams: SessionParams;
  isValidSession: boolean;
  updateSessionParams: (params: SessionParams) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionParams, setSessionParams] = useState<SessionParams>({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = getSessionParams();
    setSessionParams(params);
    setIsValidSession(!!(params.hotel_id && params.room_number));
  }, []);
  const updateSessionParams = (params: SessionParams) => {
    setSessionParams(params);
    setIsValidSession(!!(params.hotel_id && params.room_number));
  };

  // Prevent hydration mismatch by using default values until mounted
  const contextValue = {
    sessionParams: mounted ? sessionParams : {},
    isValidSession: mounted ? isValidSession : false,
    updateSessionParams,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
