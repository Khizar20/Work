'use client';

import { useState, useEffect } from 'react';
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
import { 
  Search,
  UserPlus,
  UserCog,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  BadgeCheck,
  X
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getStaff } from '../utils/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Staff member type definition
interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  status: 'active' | 'onLeave' | 'training';
  avatarUrl?: string;
  emergencyContact?: string;
  specialization?: string[];
  languages?: string[];
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'management' | 'operations' | 'frontDesk'>('all');
  const [newStaffMember, setNewStaffMember] = useState<Partial<StaffMember>>({
    name: '',
    position: '',
    department: 'operations',
    email: '',
    phone: '',
    location: 'Main Hotel',
    status: 'active'
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    // Load staff data
    async function loadStaff() {
      try {
        // In a real app, we would fetch from supabase
        // const data = await getStaff();
        // setStaff(data || mockStaff);
        
        // Using mock data for now
        setStaff(mockStaff);
      } catch (error) {
        console.error('Error loading staff data:', error);
      }
    }
    
    loadStaff();
  }, []);

  // Mock staff data
  const mockStaff: StaffMember[] = [
    {
      id: '1',
      name: 'Sophia Reynolds',
      position: 'Hotel Manager',
      department: 'management',
      email: 'sophia.reynolds@hotel.com',
      phone: '(555) 123-4567',
      location: 'Main Hotel',
      joinDate: '2020-05-15',
      status: 'active',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      specialization: ['Operations', 'Strategic Planning', 'Team Leadership'],
      languages: ['English', 'French', 'Spanish']
    },
    {
      id: '2',
      name: 'Alexander Chen',
      position: 'Front Desk Manager',
      department: 'frontDesk',
      email: 'alexander.chen@hotel.com',
      phone: '(555) 234-5678',
      location: 'Main Hotel',
      joinDate: '2021-02-10',
      status: 'active',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      specialization: ['Customer Service', 'Scheduling', 'Problem Resolution'],
      languages: ['English', 'Mandarin']
    },
    {
      id: '3',
      name: 'Olivia Martinez',
      position: 'Housekeeping Supervisor',
      department: 'operations',
      email: 'olivia.martinez@hotel.com',
      phone: '(555) 345-6789',
      location: 'Main Hotel',
      joinDate: '2021-09-22',
      status: 'active',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      specialization: ['Inventory Management', 'Staff Training', 'Quality Control'],
      languages: ['English', 'Spanish']
    },
    {
      id: '4',
      name: 'William Jackson',
      position: 'Concierge',
      department: 'frontDesk',
      email: 'william.jackson@hotel.com',
      phone: '(555) 456-7890',
      location: 'Main Hotel',
      joinDate: '2022-01-15',
      status: 'active',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      specialization: ['Guest Relations', 'Local Knowledge', 'Reservations'],
      languages: ['English', 'French', 'German']
    },
    {
      id: '5',
      name: 'Emma Thompson',
      position: 'HR Manager',
      department: 'management',
      email: 'emma.thompson@hotel.com',
      phone: '(555) 567-8901',
      location: 'Corporate Office',
      joinDate: '2020-08-05',
      status: 'active',
      avatarUrl: 'https://i.pravatar.cc/150?img=20',
      specialization: ['Recruitment', 'Employee Relations', 'Policy Development'],
      languages: ['English']
    },
    {
      id: '6',
      name: 'James Wilson',
      position: 'Maintenance Technician',
      department: 'operations',
      email: 'james.wilson@hotel.com',
      phone: '(555) 678-9012',
      location: 'Main Hotel',
      joinDate: '2021-11-30',
      status: 'onLeave',
      avatarUrl: 'https://i.pravatar.cc/150?img=26',
      specialization: ['HVAC Systems', 'Electrical', 'Plumbing'],
      languages: ['English']
    },
    {
      id: '7',
      name: 'Ava Johnson',
      position: 'Guest Relations Specialist',
      department: 'frontDesk',
      email: 'ava.johnson@hotel.com',
      phone: '(555) 789-0123',
      location: 'Main Hotel',
      joinDate: '2022-06-10',
      status: 'training',
      avatarUrl: 'https://i.pravatar.cc/150?img=18',
      specialization: ['Customer Service', 'Conflict Resolution'],
      languages: ['English', 'Spanish']
    },
    {
      id: '8',
      name: 'Michael Brown',
      position: 'Food & Beverage Manager',
      department: 'operations',
      email: 'michael.brown@hotel.com',
      phone: '(555) 890-1234',
      location: 'Restaurant',
      joinDate: '2021-04-18',
      status: 'active',
      avatarUrl: 'https://i.pravatar.cc/150?img=32',
      specialization: ['Menu Planning', 'Inventory Control', 'Staff Training'],
      languages: ['English', 'Italian']
    }
  ];

  // Filter staff based on search query and active tab
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      member.department === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Function to get status badge color
  const getStatusBadge = (status: StaffMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">Active</Badge>;
      case 'onLeave':
        return <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">On Leave</Badge>;
      case 'training':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">Training</Badge>;
      default:
        return null;
    }
  };

  // Function to handle adding new staff member
  const handleAddStaffMember = () => {
    // Here you would typically send data to your backend
    const newMember: StaffMember = {
      id: (staff.length + 1).toString(),
      name: newStaffMember.name || '',
      position: newStaffMember.position || '',
      department: newStaffMember.department as StaffMember['department'] || 'operations',
      email: newStaffMember.email || '',
      phone: newStaffMember.phone || '',
      location: newStaffMember.location || 'Main Hotel',
      joinDate: new Date().toISOString().split('T')[0],
      status: newStaffMember.status as StaffMember['status'] || 'active',
    };
    
    setStaff([...staff, newMember]);
    setIsAddDialogOpen(false);
    setNewStaffMember({
      name: '',
      position: '',
      department: 'operations',
      email: '',
      phone: '',
      location: 'Main Hotel',
      status: 'active'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Team Management</h1>
          <p className="text-white/70">
            Manage your hotel staff members, departments, and roles
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search staff..."
              className="pl-9 bg-white/5 border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className={`border-white/20 ${activeView === 'grid' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveView('grid')}
            >
              Grid
            </Button>
            <Button 
              variant="outline" 
              className={`border-white/20 ${activeView === 'table' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveView('table')}
            >
              Table
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-[#1f1f23] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Enter the details for the new team member
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newStaffMember.name}
                      onChange={(e) => setNewStaffMember({...newStaffMember, name: e.target.value})}
                      className="col-span-3 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">
                      Position
                    </Label>
                    <Input
                      id="position"
                      value={newStaffMember.position}
                      onChange={(e) => setNewStaffMember({...newStaffMember, position: e.target.value})}
                      className="col-span-3 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Department
                    </Label>
                    <select
                      id="department"
                      value={newStaffMember.department}
                      onChange={(e) => setNewStaffMember({...newStaffMember, department: e.target.value})}
                      className="col-span-3 flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white"
                    >
                      <option value="management">Management</option>
                      <option value="operations">Operations</option>
                      <option value="frontDesk">Front Desk</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStaffMember.email}
                      onChange={(e) => setNewStaffMember({...newStaffMember, email: e.target.value})}
                      className="col-span-3 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={newStaffMember.phone}
                      onChange={(e) => setNewStaffMember({...newStaffMember, phone: e.target.value})}
                      className="col-span-3 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={newStaffMember.location}
                      onChange={(e) => setNewStaffMember({...newStaffMember, location: e.target.value})}
                      className="col-span-3 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <select
                      id="status"
                      value={newStaffMember.status}
                      onChange={(e) => setNewStaffMember({...newStaffMember, status: e.target.value as StaffMember['status']})}
                      className="col-span-3 flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white"
                    >
                      <option value="active">Active</option>
                      <option value="onLeave">On Leave</option>
                      <option value="training">Training</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="border-white/20 text-white" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStaffMember} className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">
                    Add Staff Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Department tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Departments</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="frontDesk">Front Desk</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {activeView === 'grid' ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <Card key={member.id} className="overflow-hidden bg-white/5 border-white/10">
                      <div className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 border-2 border-white/20">
                          {member.avatarUrl ? (
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <h3 className="font-bold text-lg mt-4 text-white">{member.name}</h3>
                        <p className="text-white/80 font-medium">{member.position}</p>
                        
                        <div className="mt-2">
                          {getStatusBadge(member.status)}
                        </div>
                        
                        <div className="w-full mt-4 space-y-3 text-left">
                          <div className="flex items-center gap-2 text-white/70">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{member.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {member.specialization && (
                          <div className="mt-4 flex flex-wrap gap-1 justify-center">
                            {member.specialization.map(spec => (
                              <Badge key={spec} variant="outline" className="border-white/20 text-white/80">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-white/10 p-4">
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" className="border-white/20 text-white">
                            <UserCog className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-white/20 text-white">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1f1f23] border-white/10 text-white">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <span>{member.name}</span>
                                  {member.status === 'active' && (
                                    <BadgeCheck className="h-5 w-5 text-emerald-500" />
                                  )}
                                </DialogTitle>
                                <DialogDescription className="text-white/70">
                                  {member.position} · {member.department.charAt(0).toUpperCase() + member.department.slice(1)}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16 border-2 border-white/20">
                                    {member.avatarUrl ? (
                                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-white/70" />
                                      <span>{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-white/70" />
                                      <span>{member.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-white/70" />
                                      <span>{member.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-white/70" />
                                      <span>{member.department.charAt(0).toUpperCase() + member.department.slice(1)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border-t border-white/10 pt-4">
                                  <h4 className="text-sm font-medium mb-2">Specializations</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {member.specialization?.map(spec => (
                                      <Badge key={spec} variant="outline" className="border-white/20 text-white/80">
                                        {spec}
                                      </Badge>
                                    )) || 'None specified'}
                                  </div>
                                </div>
                                
                                <div className="border-t border-white/10 pt-4">
                                  <h4 className="text-sm font-medium mb-2">Languages</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {member.languages?.map(lang => (
                                      <Badge key={lang} variant="outline" className="border-white/20 text-white/80">
                                        {lang}
                                      </Badge>
                                    )) || 'None specified'}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/70">No staff members found matching your search criteria</p>
                  </div>
                )}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-white/5 border-white/10">
                        <TableHead className="text-white/90">Name</TableHead>
                        <TableHead className="text-white/90">Position</TableHead>
                        <TableHead className="text-white/90">Department</TableHead>
                        <TableHead className="text-white/90">Email</TableHead>
                        <TableHead className="text-white/90">Phone</TableHead>
                        <TableHead className="text-white/90">Status</TableHead>
                        <TableHead className="text-white/90 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.length > 0 ? (
                        filteredStaff.map((member) => (
                          <TableRow key={member.id} className="hover:bg-white/5 border-white/10">
                            <TableCell className="font-medium text-white">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {member.avatarUrl ? (
                                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white text-xs">
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                {member.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{member.position}</TableCell>
                            <TableCell className="text-white">
                              {member.department.charAt(0).toUpperCase() + member.department.slice(1)}
                            </TableCell>
                            <TableCell className="text-white/70">{member.email}</TableCell>
                            <TableCell className="text-white/70">{member.phone}</TableCell>
                            <TableCell>{getStatusBadge(member.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="h-8 border-white/20">
                                  <UserCog className="h-3.5 w-3.5" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 border-white/20">
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-[#1f1f23] border-white/10 text-white">
                                    <DialogHeader>
                                      <DialogTitle>{member.name}</DialogTitle>
                                      <DialogDescription className="text-white/70">
                                        {member.position} · {member.department.charAt(0).toUpperCase() + member.department.slice(1)}
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4">
                                      {/* Same detail view as in the card view */}
                                      <div className="flex items-start gap-4">
                                        <Avatar className="h-16 w-16 border-2 border-white/20">
                                          {member.avatarUrl ? (
                                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                                          ) : (
                                            <AvatarFallback className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">
                                              {member.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                          )}
                                        </Avatar>
                                        
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-white/70" />
                                            <span>{member.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-white/70" />
                                            <span>{member.phone}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-white/70" />
                                            <span>{member.location}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-white/70" />
                                            <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t border-white/10 pt-4">
                                        <h4 className="text-sm font-medium mb-2">Specializations</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {member.specialization?.map(spec => (
                                            <Badge key={spec} variant="outline" className="border-white/20 text-white/80">
                                              {spec}
                                            </Badge>
                                          )) || 'None specified'}
                                        </div>
                                      </div>
                                      
                                      <div className="border-t border-white/10 pt-4">
                                        <h4 className="text-sm font-medium mb-2">Languages</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {member.languages?.map(lang => (
                                            <Badge key={lang} variant="outline" className="border-white/20 text-white/80">
                                              {lang}
                                            </Badge>
                                          )) || 'None specified'}
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="outline" size="sm" className="h-8 border-white/20 text-red-400 hover:text-red-300 hover:bg-red-950/20">
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-white/5 border-white/10">
                          <TableCell colSpan={7} className="text-center py-6 text-white/50">
                            No staff members found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Key stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Total Staff</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{staff.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(206, 84%, 29%, 1) 0%, hsla(248, 9%, 43%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Management</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{staff.filter(m => m.department === 'management').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Operations</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{staff.filter(m => m.department === 'operations').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(30, 14%, 78%, 1) 0%, hsla(34, 98%, 44%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Front Desk</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{staff.filter(m => m.department === 'frontDesk').length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
