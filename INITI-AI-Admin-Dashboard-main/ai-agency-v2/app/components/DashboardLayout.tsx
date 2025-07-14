'use client';

import { useAuth } from "@/app/utils/auth";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DocumentUploader from './DocumentUploader';
import ConnectionStatus from './ConnectionStatus';
import {
  Bell,
  Upload,
  Search,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New booking',
      message: 'Room 304 booked for June 10-12',
      time: '5 min ago',
      read: false
    },
    {
      id: 2,
      title: 'Maintenance request',
      message: 'Room 201 reported AC issue',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Checkout reminder',
      message: '6 checkouts scheduled for today',
      time: '3 hours ago',
      read: true
    }
  ]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col overflow-hidden">        {/* Top navbar */}
        <header className="backdrop-blur-md bg-white/5 border-b border-white/10">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2 text-white hover:bg-white/10" 
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
              
              <div className="relative md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/60" />
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-8 md:w-full w-40 bg-white/10 border-white/10 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/20" 
                />
              </div>
            </div>              <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="hidden md:block">
                <ConnectionStatus />
              </div>
              {/* Upload Document */}<Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="hidden sm:flex bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] text-white border-none hover:opacity-90 transition-opacity shadow-md"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload PDF, DOCX, PPTX, PNG or JPEG files to enhance AI chatbot responses.
                    </DialogDescription>
                  </DialogHeader>
                  <DocumentUploader 
                    onSuccess={() => {
                      setShowUploadDialog(false);
                      // Refresh the page to show new document
                      window.location.reload();
                    }}
                    onCancel={() => setShowUploadDialog(false)}
                  />
                </DialogContent>
              </Dialog>
                {/* Notification Bell */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 bg-[hsla(34,98%,44%,1)] rounded-full"></span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>                <DropdownMenuContent align="end" className="w-80 bg-[hsla(279,34%,43%,0.95)] backdrop-blur-md border-white/10">
                  <DropdownMenuLabel className="flex items-center justify-between text-white">
                    <span>Notifications</span>
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-white hover:bg-white/10">
                      Mark all read
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-0 focus:bg-white/10">
                        <div className={`flex p-3 w-full cursor-pointer ${!notification.read ? 'bg-white/10' : ''}`}>
                          <div>
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-white/70">{notification.message}</p>
                            <p className="text-xs text-white/50 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-white/70">
                      No notifications
                    </div>
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem asChild className="focus:bg-white/10">
                    <Link href="/notifications" className="w-full text-center text-sm text-white/90 hover:text-white cursor-pointer">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                {/* User Profile */}
              <DropdownMenu>                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 cursor-pointer">
                    <Avatar className="h-8 w-8 ring-2 ring-white/30">
                      <AvatarImage src="/avatar.png" alt={user?.email || 'User'} />
                      <AvatarFallback className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">
                        {(user?.email?.charAt(0) || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger><DropdownMenuContent align="end" className="bg-[hsla(279,34%,43%,0.95)] backdrop-blur-md border-white/10">
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem asChild className="text-white focus:bg-white/10 cursor-pointer">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white focus:bg-white/10 cursor-pointer">
                    <Link href="/user-settings">Settings</Link>
                  </DropdownMenuItem><DropdownMenuSeparator className="bg-white/20" />                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        // Give visual feedback before redirect
                        const menuItem = document.activeElement;
                        if (menuItem) {
                          menuItem.innerHTML = '<span class="flex items-center"><span class="animate-spin mr-2">⚪</span> Logging out...</span>';
                          menuItem.setAttribute('disabled', 'true');
                        }
                        
                        await signOut();
                        window.location.href = '/login';
                      } catch (error) {
                        console.error('Error during logout:', error);
                        // Fallback - force redirect
                        window.location.href = '/login';
                      }
                    }} 
                    className="text-white focus:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
          {/* Main content area */}
        <main className="flex-1 overflow-auto p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}