'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  User,
  Calendar,
  Loader2,
  Bed,
  Clock
} from 'lucide-react';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  base_price: number;
  status: string;
  floor_number?: number;
  amenities?: string[];
  description?: string;
  is_active: boolean;
}

interface Guest {
  id: string;
  hotel_id: string;
  hotel_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  room_number: string | null;
  check_in: string | null;
  check_out: string | null;
  created_at: string;
  updated_at: string;
}

interface GuestFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  country: string;
  room_number: string;
  check_in: string;
  check_out: string;
}

export default function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    address: '',
    city: '',
    state: '',
    country: '',
    room_number: '',
    check_in: '',
    check_out: ''
  });

  // Get current date time for validation
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Fetch available rooms
  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await fetch('/api/rooms/available');
      const data = await response.json();

      if (response.ok) {
        setRooms(data.rooms || []);
      } else {
        console.error('Failed to fetch rooms:', data.error);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Fetch guests
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      });

      const response = await fetch(`/api/guests?${params}`);
      const data = await response.json();

      if (response.ok) {
        setGuests(data.guests);
        setTotalPages(data.pagination.totalPages);
      } else {
        alert('Failed to fetch guests');
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      alert('Failed to fetch guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchGuests();
  }, [currentPage, searchTerm]);

  // Handle form submission for adding new guest
  const handleAddGuest = async () => {
    // Validate all required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'address', 'city', 'state', 'country', 'room_number', 'check_in', 'check_out'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof GuestFormData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate check-in is not before current date
    const currentDateTime = new Date();
    const checkInDateTime = new Date(formData.check_in);
    
    if (checkInDateTime < currentDateTime) {
      alert('Check-in date and time cannot be in the past');
      return;
    }

    // Validate check-out is after check-in
    if (new Date(formData.check_out) <= new Date(formData.check_in)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Guest added successfully');
        setShowAddDialog(false);
        resetForm();
        fetchGuests();
      } else {
        alert(data.error || 'Failed to add guest');
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('Failed to add guest');
    }
  };

  // Handle form submission for editing guest
  const handleEditGuest = async () => {
    if (!editingGuest) return;

    // Validate all required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'address', 'city', 'state', 'country', 'room_number', 'check_in', 'check_out'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof GuestFormData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate check-in is not before current date
    const currentDateTime = new Date();
    const checkInDateTime = new Date(formData.check_in);
    
    if (checkInDateTime < currentDateTime) {
      alert('Check-in date and time cannot be in the past');
      return;
    }

    // Validate check-out is after check-in
    if (new Date(formData.check_out) <= new Date(formData.check_in)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      const response = await fetch(`/api/guests/${editingGuest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Guest updated successfully');
        setShowEditDialog(false);
        setEditingGuest(null);
        resetForm();
        fetchGuests();
      } else {
        alert(data.error || 'Failed to update guest');
      }
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Failed to update guest');
    }
  };

  // Handle guest deletion
  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Guest deleted successfully');
        fetchGuests();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete guest');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest');
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      nationality: '',
      address: '',
      city: '',
      state: '',
      country: '',
      room_number: '',
      check_in: '',
      check_out: ''
    });
  };

  // Handle edit button click
  const handleEditClick = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name || '',
      last_name: guest.last_name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      nationality: guest.nationality || '',
      address: guest.address || '',
      city: guest.city || '',
      state: guest.state || '',
      country: guest.country || '',
      room_number: guest.room_number || '',
      check_in: guest.check_in ? new Date(guest.check_in).toISOString().slice(0, 16) : '',
      check_out: guest.check_out ? new Date(guest.check_out).toISOString().slice(0, 16) : ''
    });
    setShowEditDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guest Management</h1>
            <p className="text-gray-500">
              Manage guest information and details
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Guest</DialogTitle>
                <DialogDescription>
                  Enter the guest's information below. All fields are required.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Enter nationality"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room *</Label>
                  {roomsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading rooms...</span>
                    </div>
                  ) : (
                    <select
                      id="room_number"
                      value={formData.room_number}
                      onChange={(e) => handleInputChange('room_number', e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white ring-offset-1 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      required
                      style={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <option value="" style={{ color: 'black', backgroundColor: 'white' }}>Select a room</option>
                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <option 
                            key={room.id} 
                            value={room.room_number}
                            style={{ color: 'black', backgroundColor: 'white' }}
                          >
                            {room.room_number} - {room.room_type} (${room.base_price}/night)
                          </option>
                        ))
                      ) : (
                        <option value="" disabled style={{ color: 'black', backgroundColor: 'white' }}>
                          No rooms available
                        </option>
                      )}
                    </select>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="check_in">Check-in Date & Time *</Label>
                  <Input
                    id="check_in"
                    type="datetime-local"
                    value={formData.check_in}
                    onChange={(e) => handleInputChange('check_in', e.target.value)}
                    min={getCurrentDateTime()}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="check_out">Check-out Date & Time *</Label>
                  <Input
                    id="check_out"
                    type="datetime-local"
                    value={formData.check_out}
                    onChange={(e) => handleInputChange('check_out', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state or province"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                    rows={2}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGuest}>
                  Add Guest
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search guests by name, email, or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guests List */}
        <Card>
          <CardHeader>
            <CardTitle>Guests</CardTitle>
            <CardDescription>
              {loading ? 'Loading guests...' : `${guests.length} guests found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : guests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No guests found
              </div>
            ) : (
              <div className="space-y-4">
                {guests.map((guest) => (
                  <div key={guest.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-gray-900">
                            {guest.first_name} {guest.last_name}
                          </h3>
                          {guest.room_number && (
                            <Badge variant="outline">
                              <Building className="w-3 h-3 mr-1" />
                              Room {guest.room_number}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 group-hover:text-gray-700">
                          {guest.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {guest.email}
                            </div>
                          )}
                          {guest.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {guest.phone}
                            </div>
                          )}
                          {guest.nationality && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {guest.nationality}
                            </div>
                          )}
                          {guest.city && guest.country && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {guest.city}, {guest.country}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Check-in: {formatDate(guest.check_in)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Check-out: {formatDate(guest.check_out)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(guest.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(guest)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Guest</DialogTitle>
              <DialogDescription>
                Update the guest's information below. All fields are required.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone *</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_nationality">Nationality *</Label>
                <Input
                  id="edit_nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_room_number">Room *</Label>
                {roomsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading rooms...</span>
                  </div>
                ) : (
                  <select
                    id="edit_room_number"
                    value={formData.room_number}
                    onChange={(e) => handleInputChange('room_number', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white ring-offset-1 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    required
                    style={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <option value="" style={{ color: 'black', backgroundColor: 'white' }}>Select a room</option>
                    {rooms.length > 0 ? (
                      rooms.map((room) => (
                        <option 
                          key={room.id} 
                          value={room.room_number}
                          style={{ color: 'black', backgroundColor: 'white' }}
                        >
                          {room.room_number} - {room.room_type} (${room.base_price}/night)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled style={{ color: 'black', backgroundColor: 'white' }}>
                        No rooms available
                      </option>
                    )}
                  </select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_check_in">Check-in Date & Time *</Label>
                <Input
                  id="edit_check_in"
                  type="datetime-local"
                  value={formData.check_in}
                  onChange={(e) => handleInputChange('check_in', e.target.value)}
                  min={getCurrentDateTime()}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_check_out">Check-out Date & Time *</Label>
                <Input
                  id="edit_check_out"
                  type="datetime-local"
                  value={formData.check_out}
                  onChange={(e) => handleInputChange('check_out', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_country">Country *</Label>
                <Input
                  id="edit_country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_state">State/Province *</Label>
                <Input
                  id="edit_state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state or province"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_city">City *</Label>
                <Input
                  id="edit_city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit_address">Address *</Label>
                <Textarea
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditGuest}>
                Update Guest
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 