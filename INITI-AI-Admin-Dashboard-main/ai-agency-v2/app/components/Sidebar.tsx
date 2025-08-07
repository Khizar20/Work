'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/app/utils/auth";
import { 
  LayoutDashboard, 
  MessageCircle, 
  FileText, 
  Hotel, 
  Users, 
  Settings,
  LogOut,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { Progress } from '../../components/ui/progress';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { name: 'Chat Analytics', href: '/chatbot-metrics', icon: <MessageCircle size={18} /> },
  { name: 'Documents', href: '/documents-library', icon: <FileText size={18} /> },
  { name: 'Guest Management', href: '/guest-management', icon: <Users size={18} /> },
  { name: 'Room Management', href: '/hotel-management', icon: <Hotel size={18} /> },
  { name: 'Team', href: '/staff', icon: <Users size={18} /> },
  { name: 'My Profile', href: '/profile', icon: <UserCircle size={18} /> },
  { name: 'Settings', href: '/user-settings', icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };
  return (
    <aside className="w-64 flex flex-col h-screen" 
           style={{ 
             background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)",
             boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
           }}>
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold mr-2">
            H
          </div>
          <h1 className="text-lg font-bold text-white">HospitalityAI</h1>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`mr-3 ${isActive ? 'text-white' : 'text-white/80'}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>      {/* License Usage Widget */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">License Usage</p>
            <Link href="/user-settings" className="text-xs text-white/80 hover:text-white flex items-center">
              Upgrade <ChevronRight size={12} />
            </Link>
          </div>
            <div className="space-y-1.5">
            <Progress value={75} className="h-2" style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)"
            }} />
            <p className="text-xs text-white/70">Standard Plan</p>
          </div>
        </div>
      </div>
        <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <Link href="/profile" className="hover:opacity-80 transition-opacity">
            <div>
              <p className="text-sm font-medium text-white">{user?.email || 'admin@hotel.com'}</p>
              <p className="text-xs text-white/70">Hotel Administrator</p>
            </div>
          </Link>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center text-sm bg-white/10 text-white py-1.5 px-2 rounded-md hover:bg-white/20 transition-colors"
          style={{
            backdropFilter: "blur(4px)"
          }}
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </button>
      </div>
    </aside>
  );
}