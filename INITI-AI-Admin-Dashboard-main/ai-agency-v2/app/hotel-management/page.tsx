'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../utils/auth';
import { getUserHotelId, getHotelBaseUrl, getHotelRooms, regenerateHotelQRCodes } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import QRCodeSVG from 'react-qr-code';

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  notes?: string;
  qr_code_url?: string;
  qr_session_id?: string;
}

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'upcoming' | 'current' | 'completed' | 'cancelled';
  email: string;
  phone: string;
}

export default function HotelManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotelIdError, setHotelIdError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('https://initi-ai-client-side-site-tla9-dvm948wll.vercel.app');
  const [loading, setLoading] = useState<boolean>(true);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Mock data
  const mockRooms: Room[] = [
    { id: '1', number: '101', type: 'Standard', capacity: 2, price: 99.99, status: 'available' },
    { id: '2', number: '102', type: 'Standard', capacity: 2, price: 99.99, status: 'occupied' },
    { id: '3', number: '103', type: 'Standard', capacity: 2, price: 99.99, status: 'cleaning' },
    { id: '4', number: '201', type: 'Deluxe', capacity: 3, price: 149.99, status: 'available' },
    { id: '5', number: '202', type: 'Deluxe', capacity: 3, price: 149.99, status: 'maintenance', notes: 'Bathroom leak' },
    { id: '6', number: '301', type: 'Suite', capacity: 4, price: 249.99, status: 'available' },
    { id: '7', number: '302', type: 'Suite', capacity: 4, price: 249.99, status: 'occupied' },
  ];
  
  const mockBookings: Booking[] = [
    {
      id: '1',
      guestName: 'John Smith',
      roomNumber: '102',
      checkIn: '2025-06-05',
      checkOut: '2025-06-10',
      status: 'current',
      email: 'john.smith@example.com',
      phone: '555-123-4567'
    },
    {
      id: '2',
      guestName: 'Sarah Johnson',
      roomNumber: '302',
      checkIn: '2025-06-06',
      checkOut: '2025-06-12',
      status: 'current',
      email: 'sarah.j@example.com',
      phone: '555-987-6543'
    },
    {
      id: '3',
      guestName: 'Michael Brown',
      roomNumber: '201',
      checkIn: '2025-06-10',
      checkOut: '2025-06-15',
      status: 'upcoming',
      email: 'michael.b@example.com',
      phone: '555-222-3333'
    },
    {
      id: '4',
      guestName: 'Emily Wilson',
      roomNumber: '101',
      checkIn: '2025-06-12',
      checkOut: '2025-06-14',
      status: 'upcoming',
      email: 'emily@example.com',
      phone: '555-444-5555'
    },
    {
      id: '5',
      guestName: 'David Lee',
      roomNumber: '103',
      checkIn: '2025-06-01',
      checkOut: '2025-06-05',
      status: 'completed',
      email: 'david.lee@example.com',
      phone: '555-666-7777'
    },
  ];  useEffect(() => {
    setMounted(true);
    
    // Fetch hotel data and generate QR codes
    const fetchHotelData = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          // Step 1: Get hotel ID for current user
          const { data: hotelIdData, error: hotelIdError } = await getUserHotelId(user.id);
          
          if (hotelIdError) {
            console.error('Error fetching hotel ID:', hotelIdError);
            setHotelIdError(hotelIdError);
            // Use mock data as fallback
            setRooms(mockRooms);
            setBookings(mockBookings);
            generateQRCodes(mockRooms, null, baseUrl);
            setLoading(false);
            return;
          }

          if (!hotelIdData) {
            console.warn('No hotel ID found for user');
            setHotelIdError('User is not associated with any hotel');
            // Use mock data as fallback
            setRooms(mockRooms);
            setBookings(mockBookings);
            generateQRCodes(mockRooms, null, baseUrl);
            setLoading(false);
            return;
          }

          setHotelId(hotelIdData);
          setHotelIdError(null);

          // Step 2: Get hotel base URL
          const { data: hotelBaseUrl, error: baseUrlError } = await getHotelBaseUrl(hotelIdData);
          const currentBaseUrl = hotelBaseUrl || baseUrl;
          setBaseUrl(currentBaseUrl);

          if (baseUrlError) {
            console.warn('Error fetching hotel base URL, using fallback:', baseUrlError);
          }

          // Step 3: Get rooms from database
          const { data: hotelRooms, error: roomsError } = await getHotelRooms(hotelIdData);
          
          if (roomsError || !hotelRooms) {
            console.error('Error fetching hotel rooms:', roomsError);
            // Use mock data as fallback
            setRooms(mockRooms);
            generateQRCodes(mockRooms, hotelIdData, currentBaseUrl);
          } else {
            console.log('Successfully fetched hotel rooms:', hotelRooms.length);
            setRooms(hotelRooms);
            // Generate QR codes using database URLs if available, or create new ones
            generateQRCodesFromDatabase(hotelRooms, hotelIdData, currentBaseUrl);
          }

          // Step 4: Set bookings (using mock data for now - you can implement database fetch later)
          setBookings(mockBookings);

        } catch (err) {
          console.error('Unexpected error fetching hotel data:', err);
          setHotelIdError('Failed to fetch hotel information');
          // Use mock data as fallback
          setRooms(mockRooms);
          setBookings(mockBookings);
          generateQRCodes(mockRooms, null, baseUrl);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn('User not authenticated');
        setHotelIdError('User not authenticated');
        // Use mock data as fallback
        setRooms(mockRooms);
        setBookings(mockBookings);
        generateQRCodes(mockRooms, null, baseUrl);
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [user]);  const generateQRCodes = async (roomsData: Room[], currentHotelId: string | null, currentBaseUrl: string) => {
    const qrCodeMap: { [key: string]: string } = {};
    
    for (const room of roomsData) {
      try {
        // Generate unique session_id for each QR code
        const sessionId = uuidv4();
        
        // Create chat URL in the required format with dynamic base URL
        let chatUrl: string;
        
        if (currentHotelId) {
          // Standard format when hotel_id is available
          chatUrl = `${currentBaseUrl}/chat?hotel_id=${currentHotelId}&room_number=${room.number}&session_id=${sessionId}`;
        } else {
          // Fallback format when hotel_id is missing
          chatUrl = `${currentBaseUrl}/chat?hotel_id=MISSING_HOTEL_ID&room_number=${room.number}&session_id=${sessionId}`;
        }
        
        // Store the chat URL directly as the QR code data
        qrCodeMap[room.id] = chatUrl;
        
        console.log(`Generated QR code for room ${room.number}:`, chatUrl);
      } catch (error) {
        console.error(`Error generating QR code for room ${room.number}:`, error);
        // Create fallback QR code with error message
        const sessionId = uuidv4();
        qrCodeMap[room.id] = `${currentBaseUrl}/chat?hotel_id=ERROR&room_number=${room.number}&session_id=${sessionId}`;
      }
    }
    
    setQrCodes(qrCodeMap);
    console.log('QR codes generated:', Object.keys(qrCodeMap).length);
  };

  const generateQRCodesFromDatabase = async (roomsData: Room[], currentHotelId: string, currentBaseUrl: string) => {
    const qrCodeMap: { [key: string]: string } = {};
    
    for (const room of roomsData) {
      try {
        // Always generate a new QR code URL, ignore existing qr_code_url
        const sessionId = room.qr_session_id || uuidv4();
        const chatUrl = `${currentBaseUrl}/chat?hotel_id=${currentHotelId}&room_number=${room.number}&session_id=${sessionId}`;
        qrCodeMap[room.id] = chatUrl;
        console.log(`Generated QR code for room ${room.number}:`, chatUrl);
      } catch (error) {
        console.error(`Error processing QR code for room ${room.number}:`, error);
        // Create fallback QR code with error message
        const sessionId = uuidv4();
        qrCodeMap[room.id] = `${currentBaseUrl}/chat?hotel_id=ERROR&room_number=${room.number}&session_id=${sessionId}`;
      }
    }
    
    setQrCodes(qrCodeMap);
    console.log('QR codes generated from database data:', Object.keys(qrCodeMap).length);
  };

  // Function to regenerate all QR codes for the hotel
  const handleRegenerateQRCodes = async () => {
    if (!hotelId) {
      alert('Hotel ID not available');
      return;
    }

    setLoading(true);
    try {
      const { data: updatedCount, error } = await regenerateHotelQRCodes(hotelId);
      
      if (error) {
        console.error('Error regenerating QR codes:', error);
        alert('Failed to regenerate QR codes: ' + error);
        return;
      }

      console.log(`Regenerated QR codes for ${updatedCount} rooms`);
      
      // Refresh room data to get updated QR codes
      const { data: hotelRooms, error: roomsError } = await getHotelRooms(hotelId);
      // --- Fetch the latest base URL from the database ---
      const { data: latestBaseUrl } = await getHotelBaseUrl(hotelId);
      const currentBaseUrl = latestBaseUrl || baseUrl;
      
      if (roomsError || !hotelRooms) {
        console.error('Error refreshing rooms after QR code regeneration:', roomsError);
        alert('QR codes regenerated but failed to refresh room data');
      } else {
        setRooms(hotelRooms);
        generateQRCodesFromDatabase(hotelRooms, hotelId, currentBaseUrl);
        alert(`Successfully regenerated QR codes for ${updatedCount} rooms`);
      }
    } catch (error) {
      console.error('Unexpected error regenerating QR codes:', error);
      alert('Unexpected error occurred while regenerating QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = (roomNumber: string, chatUrl: string) => {
    if (!chatUrl) {
      console.error('No chat URL available for room', roomNumber);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Room ${roomNumber}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                text-align: center;
                padding: 20px;
                background: #f5f5f5;
              }
              .print-container {
                background: white;
                max-width: 400px;
                margin: 0 auto;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .hotel-header {
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
              }
              .hotel-name {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin: 0;
              }
              .room-info {
                margin: 20px 0;
                font-size: 20px;
                font-weight: bold;
                color: #444;
              }
              .qr-code {
                margin: 20px 0;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 8px;
                display: inline-block;
              }
              .instructions {
                font-size: 14px;
                color: #666;
                margin: 15px 0;
                line-height: 1.4;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888;
                border-top: 1px solid #ddd;
                padding-top: 15px;
              }
              .features {
                text-align: left;
                margin: 15px 0;
                font-size: 13px;
                color: #555;
              }
              .features ul {
                list-style-type: none;
                padding: 0;
              }
              .features li {
                padding: 3px 0;
                position: relative;
                padding-left: 20px;
              }
              .features li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
              }
              @media print {
                body { 
                  margin: 0; 
                  background: white;
                }
                .print-container { 
                  box-shadow: none; 
                  max-width: none;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">              <div class="hotel-header">
                <h1 class="hotel-name">Hotel Chat Service</h1>
                <div style="font-size: 14px; color: #666;">AI Assistant QR Code</div>
              </div>
              
              <div class="room-info">Room ${roomNumber}</div>
                <div class="qr-code">
                <div style="background: white; padding: 10px; border-radius: 5px; display: inline-block;">
                  <div style="width: 200px; height: 200px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; color: #666;">
                    QR Code for Room ${roomNumber}<br/>
                    <small style="font-size: 8px; word-break: break-all;">${chatUrl}</small>
                  </div>
                </div>
              </div>
              
              <div class="instructions">
                <strong>Scan this QR code with your smartphone to:</strong>
              </div>
                <div class="features">
                <ul>
                  <li>Start a chat session with our AI assistant</li>
                  <li>Get instant help with room services</li>
                  <li>Request housekeeping or maintenance</li>
                  <li>Order room service and amenities</li>
                  <li>Get local recommendations and directions</li>
                  <li>Contact hotel support 24/7</li>
                </ul>
              </div>
                <div class="footer">
                <div><strong>Chat URL:</strong></div>
                <div style="font-size: 10px; word-break: break-all; background: #f8f8f8; padding: 8px; border-radius: 4px; margin: 10px 0;">
                  ${chatUrl}
                </div>
                <div>Generated on: ${currentDate}</div>
                <div style="margin-top: 5px;">
                  ${hotelId ? `Hotel ID: ${hotelId}` : 'Hotel ID: Not Available'}
                </div>
                <div style="margin-top: 5px;">For assistance, scan the QR code or visit the URL above</div>
              </div>
            </div>
          </body>
        </html>
      `);      printWindow.document.close();
      
      // Auto-print after a short delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handlePrintAllQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      let htmlContent = `
        <html>
          <head>
            <title>All Room QR Codes</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                padding: 20px;
                background: white;
              }
              .page-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #333;
                padding-bottom: 20px;
              }
              .hotel-name {
                font-size: 28px;
                font-weight: bold;
                color: #333;
                margin: 0;
              }
              .subtitle {
                font-size: 16px;
                color: #666;
                margin: 5px 0;
              }
              .qr-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
              }
              .qr-item {
                border: 2px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                background: #fafafa;
                break-inside: avoid;
              }
              .room-title {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
              }
              .room-details {
                font-size: 12px;
                color: #666;
                margin-bottom: 15px;
              }
              .qr-code {
                margin: 10px 0;
                background: white;
                padding: 10px;
                border-radius: 5px;
                display: inline-block;
              }
              .page-footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #888;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { margin: 0; }
                .qr-grid { break-inside: auto; }
                .qr-item { break-inside: avoid; }
              }
            </style>
          </head>
          <body>            <div class="page-header">
              <h1 class="hotel-name">Hotel Chat Service QR Codes</h1>
              <div class="subtitle">AI Assistant Access Codes</div>
              <div class="subtitle">Generated on: ${currentDate}</div>
            </div>
            
            <div class="qr-grid">
      `;

      filteredRooms.forEach(room => {
        if (qrCodes[room.id]) {
          htmlContent += `
            <div class="qr-item">
              <div class="room-title">Room ${room.number}</div>
              <div class="room-details">
                ${room.type} • ${room.capacity} guests • $${room.price.toFixed(2)}/night<br>
                Status: ${room.status}
              </div>              <div class="qr-code">
                <div style="background: white; padding: 10px; border-radius: 5px; display: inline-block;">
                  <div style="width: 180px; height: 180px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; text-align: center; color: #666;">
                    QR Code for Room ${room.number}<br/>
                    <small style="font-size: 8px; word-break: break-all;">${qrCodes[room.id]}</small>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      });

      htmlContent += `
            </div>
              <div class="page-footer">
              <div><strong>Instructions:</strong> Cut out each QR code and place in the corresponding room</div>
              <div>Guests can scan these codes to start a chat session with the AI assistant</div>
              <div style="margin-top: 10px;">
                ${hotelId ? `Hotel ID: ${hotelId}` : 'Hotel ID: Not Available'}
              </div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Hotel Management</h1>
        </div>
      </DashboardLayout>
    );
  }

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => {
    return (
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    return (
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get status badge for rooms
  const getRoomStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600">Occupied</Badge>;
      case 'cleaning':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600">Cleaning</Badge>;
      case 'maintenance':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600">Maintenance</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get status badge for bookings
  const getBookingStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-gradient-to-r from-purple-500 to-purple-600">Upcoming</Badge>;
      case 'current':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600">Current</Badge>;
      case 'completed':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Hotel Management</h1>
          <p className="text-white/70">
            Manage rooms, bookings, and guest information
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-full md:w-72">
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {activeTab === 'rooms' ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Room</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new room
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="room-number" className="text-right">
                      Room Number
                    </Label>
                    <Input id="room-number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="room-type" className="text-right">
                      Room Type
                    </Label>
                    <select 
                      id="room-type" 
                      className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white col-span-3"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input id="capacity" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price ($)
                    </Label>
                    <Input id="price" type="number" step="0.01" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Booking</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Booking</DialogTitle>
                  <DialogDescription>
                    Enter guest and booking details
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guest-name" className="text-right">
                      Guest Name
                    </Label>
                    <Input id="guest-name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="room-number" className="text-right">
                      Room
                    </Label>
                    <select 
                      id="room-number" 
                      className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white col-span-3"
                    >
                      {rooms
                        .filter(room => room.status === 'available')
                        .map(room => (
                          <option key={room.id} value={room.number}>
                            {room.number} - {room.type} (${room.price})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="check-in" className="text-right">
                      Check-in
                    </Label>
                    <Input id="check-in" type="date" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="check-out" className="text-right">
                      Check-out
                    </Label>
                    <Input id="check-out" type="date" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input id="phone" type="tel" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Booking</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>        <Tabs defaultValue="rooms" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.number}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell className="text-center">{room.capacity}</TableCell>
                        <TableCell className="text-right">${room.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          {getRoomStatusBadge(room.status)}
                          {room.notes && (
                            <div className="text-xs text-white/50 mt-1">{room.notes}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Status</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Update Room Status</DialogTitle>
                                  <DialogDescription>
                                    Change status for Room {room.number}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">
                                      Status
                                    </Label>
                                    <select 
                                      id="status" 
                                      className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white col-span-3"
                                      defaultValue={room.status}
                                    >
                                      <option value="available">Available</option>
                                      <option value="occupied">Occupied</option>
                                      <option value="cleaning">Cleaning</option>
                                      <option value="maintenance">Maintenance</option>
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="notes" className="text-right">
                                      Notes
                                    </Label>
                                    <Input 
                                      id="notes" 
                                      className="col-span-3"
                                      defaultValue={room.notes} 
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit">Update</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-white/50">
                        No rooms found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-0">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.guestName}</div>
                          <div className="text-xs text-white/50">{booking.email}</div>
                        </TableCell>
                        <TableCell>{booking.roomNumber}</TableCell>
                        <TableCell>{booking.checkIn}</TableCell>
                        <TableCell>{booking.checkOut}</TableCell>
                        <TableCell className="text-center">
                          {getBookingStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">View</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Booking Details</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-1">
                                    <Label>Guest Name</Label>
                                    <div className="text-white">{booking.guestName}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Contact Information</Label>
                                    <div className="text-white">Email: {booking.email}</div>
                                    <div className="text-white">Phone: {booking.phone}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Stay Details</Label>
                                    <div className="text-white">Room: {booking.roomNumber}</div>
                                    <div className="text-white">Check-in: {booking.checkIn}</div>
                                    <div className="text-white">Check-out: {booking.checkOut}</div>
                                    <div className="text-white">Status: {booking.status}</div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Edit Booking</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">Edit</Button>
                            {booking.status === 'upcoming' && (
                              <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-500/10">Cancel</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-white/50">
                        No bookings found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>            </Card>
          </TabsContent>          <TabsContent value="qrcodes" className="mt-0">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Room QR Codes</h3>
                <p className="text-white/70 mb-4">
                  Each room has a unique QR code that guests can scan to access room information and services.
                </p>
                
                {/* QR Code Management Section */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/20">
                  <h4 className="font-semibold text-white mb-3">QR Code Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/70">Current Base URL</Label>
                      <div className="text-sm text-white bg-black/20 p-2 rounded mt-1">
                        {baseUrl}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/70">Hotel Status</Label>
                      <div className="text-sm text-white mt-1">
                        {hotelId ? (
                          <span className="text-green-400">✓ Connected (Hotel ID: {hotelId})</span>
                        ) : (
                          <span className="text-red-400">✗ {hotelIdError || 'Not connected'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleRegenerateQRCodes}
                      disabled={!hotelId || loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Regenerating...' : 'Regenerate All QR Codes'}
                    </Button>
                    <Button 
                      onClick={() => handlePrintAllQR()}
                      disabled={filteredRooms.length === 0}
                      variant="outline"
                    >
                      Print All QR Codes
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="p-4 bg-white/5 border-white/20">
                    <div className="text-center">
                      <div className="mb-3">
                        <h4 className="text-lg font-semibold text-white">Room {room.number}</h4>
                        <p className="text-sm text-white/70">{room.type}</p>
                        {getRoomStatusBadge(room.status)}
                      </div>
                        <div className="mb-4 bg-white p-2 rounded-lg">
                        {qrCodes[room.id] ? (
                          <QRCodeSVG 
                            value={qrCodes[room.id]}
                            size={192}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="M"
                            className="mx-auto"
                          />
                        ) : (
                          <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded">
                            <span className="text-gray-500">Loading QR Code...</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Room {room.number} QR Code</DialogTitle>
                              <DialogDescription>
                                QR code details and information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">                              <div className="text-center">
                                <div className="mb-4 bg-white p-4 rounded-lg inline-block">
                                  {qrCodes[room.id] && (
                                    <QRCodeSVG 
                                      value={qrCodes[room.id]}
                                      size={200}
                                      bgColor="#ffffff"
                                      fgColor="#000000"
                                      level="M"
                                      className="mx-auto"
                                    />
                                  )}
                                </div>
                                <div className="space-y-2 text-left">
                                  <div><span className="font-medium">Room:</span> {room.number}</div>
                                  <div><span className="font-medium">Type:</span> {room.type}</div>
                                  <div><span className="font-medium">Capacity:</span> {room.capacity} guests</div>
                                  <div><span className="font-medium">Price:</span> ${room.price.toFixed(2)}/night</div>
                                  <div><span className="font-medium">Status:</span> {room.status}</div>
                                  <div className="text-sm text-white/70 mt-3">
                                    <span className="font-medium">Chat URL:</span><br />
                                    <code className="text-xs bg-black/20 px-2 py-1 rounded break-all">
                                      {qrCodes[room.id]}
                                    </code>
                                  </div>
                                  {hotelIdError && (
                                    <div className="text-sm text-red-400 mt-3">
                                      <span className="font-medium">Note:</span> {hotelIdError}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={() => handlePrintQR(room.number, qrCodes[room.id])}
                                className="w-full"
                              >
                                Print QR Code
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          onClick={() => handlePrintQR(room.number, qrCodes[room.id])}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          disabled={!qrCodes[room.id]}
                        >
                          Print QR Code
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {filteredRooms.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/50">No rooms found matching your search criteria</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}