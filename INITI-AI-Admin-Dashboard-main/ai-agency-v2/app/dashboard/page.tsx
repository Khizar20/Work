'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from '../components/DashboardLayout';
import UserProfileCard from '../components/UserProfileCard';
import { getDashboardMetrics } from '../utils/supabase';

interface Metrics {
  totalRooms: number;
  activeRoomChatSessions: number;
  chatSessionsToday: number;
  serviceRequestsFromBot: number;
}

export default function Dashboard() {  const [metrics, setMetrics] = useState<Metrics>({
    totalRooms: 0,
    activeRoomChatSessions: 0,
    chatSessionsToday: 0,
    serviceRequestsFromBot: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await getDashboardMetrics();
        if (response.data) {
          setMetrics(response.data);
        } else if (response.error) {
          console.error('Error loading dashboard metrics:', response.error);
        }
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>          <p className="text-white/70">
            Welcome to your hotel AI Chat Assistant management dashboard. Monitor chatbot performance, track room-based chat sessions, and manage AI-driven service requests!
          </p>
        </div>
        
        {/* User Profile Card - Shows real user data from Supabase */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-white">Your Profile</h2>
          <UserProfileCard />
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Total Rooms</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.totalRooms}</p>
              </div>
            </div>
          </Card>          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Active Room Chat Sessions</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.activeRoomChatSessions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Chat Sessions Today</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.chatSessionsToday}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Room Service Requests today</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.serviceRequestsFromBot}</p>
              </div>
            </div>
          </Card>
        </div>        {/* Tabs Section */}
        <Tabs defaultValue="recent" className="space-y-4">          <TabsList>
            <TabsTrigger value="recent">Recent Chat Activity</TabsTrigger>
            <TabsTrigger value="upcoming">AI Analytics</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Guest Requests
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                3
              </span>
            </TabsTrigger>
            <TabsTrigger value="reports">Chatbot Reports 🔒</TabsTrigger>
          </TabsList><TabsContent value="recent" className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 font-medium text-lg text-white">Recent Chat Sessions</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Guest in Room 304 - Room Service Request</div>
                    <div className="text-sm text-white/70">Started: June 17, 2025 at 2:15 PM</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[hsla(120,65%,45%,1)] to-[hsla(120,65%,35%,1)] text-white hover:opacity-90">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Guest in Room 201 - Wi-Fi Information</div>
                    <div className="text-sm text-white/70">Completed: June 17, 2025 at 1:45 PM</div>
                  </div>
                  <Badge variant="outline" className="border-white/30 text-white/90">Resolved</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Guest in Room 512 - Check-out Assistance</div>
                    <div className="text-sm text-white/70">Completed: June 17, 2025 at 12:30 PM</div>
                  </div>
                  <Badge variant="outline" className="border-white/30 text-white/90">Resolved</Badge>
                </div>
              </div>
            </Card>
              <Card className="p-4">
              <div className="mb-3 font-medium text-lg text-white">AI Service Requests</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Room 201 - Extra Towels (via Chatbot)</div>
                    <div className="text-sm text-white/70">Requested: June 17, 2025 at 2:00 PM</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] text-white hover:opacity-90">Processing</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Room 305 - Restaurant Reservation (via Chatbot)</div>
                    <div className="text-sm text-white/70">Requested: June 17, 2025 at 1:15 PM</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[hsla(120,65%,45%,1)] to-[hsla(120,65%,35%,1)] text-white hover:opacity-90">Completed</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>            <TabsContent value="upcoming" className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 font-medium text-lg text-white">Chatbot Performance Trends</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Peak Chat Hours: 7-9 PM</div>
                    <div className="text-sm text-white/70">Average 15 sessions/hour during peak times</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[hsla(200,65%,45%,1)] to-[hsla(200,65%,35%,1)] text-white">Trending Up</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Most Popular: Room Service Requests</div>
                    <div className="text-sm text-white/70">42% of all chatbot interactions today</div>
                  </div>
                  <Badge variant="outline" className="border-white/30 text-white/90">Popular</Badge>
                </div>
              </div>
            </Card>
              <Card className="p-4">
              <div className="mb-3 font-medium text-lg text-white">AI Training Opportunities</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Local Attractions Questions</div>
                    <div className="text-sm text-white/70">12 unresolved queries this week</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] text-white hover:opacity-90">Needs Training</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Spa Services Information</div>
                    <div className="text-sm text-white/70">8 unclear responses logged</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] text-white hover:opacity-90">Needs Training</Badge>
                </div>              </div>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 font-medium text-lg text-white">Pending Guest Requests</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Room 312 - Extra Pillows</div>
                    <div className="text-sm text-white/70">Requested: 30 minutes ago via chatbot</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-[hsla(0,65%,45%,1)] to-[hsla(0,65%,35%,1)] text-white">Urgent</Badge>
                    <button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(120,65%,45%,1)] to-[hsla(120,65%,35%,1)] hover:opacity-90 transition-opacity shadow-md">Assign</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Room 208 - Room Service Order</div>
                    <div className="text-sm text-white/70">Requested: 45 minutes ago via chatbot</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-[hsla(30,65%,45%,1)] to-[hsla(30,65%,35%,1)] text-white">Medium</Badge>
                    <button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(120,65%,45%,1)] to-[hsla(120,65%,35%,1)] hover:opacity-90 transition-opacity shadow-md">Assign</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Room 450 - Late Checkout Request</div>
                    <div className="text-sm text-white/70">Requested: 1 hour ago via chatbot</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-gradient-to-r from-[hsla(200,65%,45%,1)] to-[hsla(200,65%,35%,1)] text-white">Low</Badge>
                    <button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(120,65%,45%,1)] to-[hsla(120,65%,35%,1)] hover:opacity-90 transition-opacity shadow-md">Assign</button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="p-4">
              <div className="mb-3 font-medium text-lg text-white">Chatbot Analytics Reports</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">June 2025 Chat Performance Report</div>
                    <div className="text-sm text-white/70">Response times, resolution rates, guest satisfaction</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] hover:opacity-90 transition-opacity shadow-md">Download</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Q2 AI-Driven Service Analysis</div>
                    <div className="text-sm text-white/70">Service requests, completion rates, efficiency metrics</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] hover:opacity-90 transition-opacity shadow-md">Download</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">Room-Based Chat Session Report</div>
                    <div className="text-sm text-white/70">Chat frequency by room type, peak usage patterns</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] hover:opacity-90 transition-opacity shadow-md">Download</button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}