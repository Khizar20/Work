'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from '../components/DashboardLayout';
import { supabase, getChatbotMetrics } from '../utils/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download, BarChart3, PieChart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChatbotMetrics {
  totalSessionsToday: number;
  uniqueUsersToday: number;
  avgResponseTime: number;
  satisfactionRate: number;
  userRetention: number;
}

// Mock data for visualization charts
const getWeeklySessionData = () => ({
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  datasets: [
    {
      label: 'Sessions',
      data: [65, 78, 52, 91, 43, 56, 74],
      borderColor: 'hsla(279, 34%, 60%, 1)',
      backgroundColor: 'hsla(279, 34%, 60%, 0.2)',
      tension: 0.4,
      fill: true,
    },
  ],
});

const getTopQuestionsData = () => ({
  labels: ['Room Service', 'Check-out Time', 'Wi-Fi Access', 'Restaurant Hours', 'Parking Info'],
  datasets: [
    {
      label: 'Frequency',
      data: [120, 98, 85, 70, 55],
      backgroundColor: [
        'hsla(279, 34%, 43%, 0.8)',
        'hsla(248, 79%, 40%, 0.8)',
        'hsla(220, 84%, 50%, 0.8)',
        'hsla(34, 98%, 44%, 0.8)',
        'hsla(30, 14%, 60%, 0.8)',
      ],
    }
  ]
});

const getUserSatisfactionData = () => ({
  labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied'],
  datasets: [
    {
      label: 'User Satisfaction',
      data: [45, 32, 15, 6, 2],
      backgroundColor: [
        'hsla(120, 70%, 40%, 0.8)',
        'hsla(79, 70%, 50%, 0.8)',
        'hsla(45, 70%, 50%, 0.8)',
        'hsla(30, 70%, 50%, 0.8)',
        'hsla(0, 70%, 50%, 0.8)',
      ],
      borderWidth: 1,
    },
  ],
});

// Mock conversation data
const recentConversations = [
  {
    id: '1',
    guest: 'John Smith',
    room: '304',
    timestamp: '10:23 AM',
    topic: 'Room Service',
    satisfaction: 'High',
    duration: '3m 45s',
  },
  {
    id: '2',
    guest: 'Mary Johnson',
    room: '215',
    timestamp: '11:05 AM',
    topic: 'Wi-Fi Setup',
    satisfaction: 'Medium',
    duration: '2m 20s',
  },
  {
    id: '3',
    guest: 'Robert Chen',
    room: '512',
    timestamp: '12:17 PM',
    topic: 'Check-out Information',
    satisfaction: 'High',
    duration: '1m 55s',
  },
  {
    id: '4',
    guest: 'Sarah Williams',
    room: '118',
    timestamp: '1:34 PM',
    topic: 'Restaurant Hours',
    satisfaction: 'High',
    duration: '4m 10s',
  },
  {
    id: '5',
    guest: 'David Miller',
    room: '420',
    timestamp: '2:45 PM',
    topic: 'Parking Information',
    satisfaction: 'Medium',
    duration: '2m 05s',
  },
];

export default function ChatbotMetrics() {
  const [metrics, setMetrics] = useState<ChatbotMetrics>({
    totalSessionsToday: 0,
    uniqueUsersToday: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    userRetention: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Chart options with dark mode and consistent styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: 'rgba(255, 255, 255, 0.8)',
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 10,
        cornerRadius: 6
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        }
      }
    }
  };
  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getChatbotMetrics(timeRange);
        setMetrics(data);
      } catch (error) {
        console.error('Error loading chatbot metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMetrics();
  }, [timeRange]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Chatbot Analytics</h1>
          <p className="text-white/70">
            Monitor your hotel's AI chat assistant performance, track customer engagement metrics, and gain insights into guest interactions.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 'today' ? 'default' : 'outline'}
            onClick={() => setTimeRange('today')}
            className={timeRange === 'today' ? 'bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] hover:opacity-90' : 'border-white/20 text-white'}
          >
            Today
          </Button>
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            className={timeRange === 'week' ? 'bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] hover:opacity-90' : 'border-white/20 text-white'}
          >
            This Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            className={timeRange === 'month' ? 'bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] hover:opacity-90' : 'border-white/20 text-white'}
          >
            This Month
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Total Sessions Today</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.totalSessionsToday}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(279, 34%, 43%, 1) 0%, hsla(248, 79%, 22%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Unique Users</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.uniqueUsersToday}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(206, 84%, 29%, 1) 0%, hsla(248, 9%, 43%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Avg. Response Time</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.avgResponseTime}s</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(30, 14%, 78%, 1) 0%, hsla(34, 98%, 44%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Satisfaction Rate</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.satisfactionRate}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4" style={{ background: "linear-gradient(135deg, hsla(30, 14%, 78%, 1) 0%, hsla(34, 98%, 44%, 1) 100%)" }}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">User Retention</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">{metrics.userRetention}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg text-white">Weekly Session Activity</h3>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <BarChart3 className="h-4 w-4 text-white/70" />
              </Button>
            </div>
            <div className="h-[300px]">
              <Line options={chartOptions} data={getWeeklySessionData()} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg text-white">Top Questions</h3>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <PieChart className="h-4 w-4 text-white/70" />
              </Button>
            </div>
            <div className="h-[300px]">
              <Bar options={chartOptions} data={getTopQuestionsData()} />
            </div>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="conversations" className="space-y-4">
          <TabsList className="grid grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversations" className="space-y-4">
            <Card className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-medium text-lg text-white">Recent Conversations</h3>
                <Button className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] hover:opacity-90 transition-opacity shadow-md">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-white/5">
                      <TableHead className="text-white/90">Guest</TableHead>
                      <TableHead className="text-white/90">Room</TableHead>
                      <TableHead className="text-white/90">Time</TableHead>
                      <TableHead className="text-white/90">Topic</TableHead>
                      <TableHead className="text-white/90">Satisfaction</TableHead>
                      <TableHead className="text-white/90 text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentConversations.map((convo) => (
                      <TableRow key={convo.id} className="hover:bg-white/5">
                        <TableCell className="font-medium text-white">{convo.guest}</TableCell>
                        <TableCell className="text-white">{convo.room}</TableCell>
                        <TableCell className="text-white/70">{convo.timestamp}</TableCell>
                        <TableCell className="text-white/70">{convo.topic}</TableCell>
                        <TableCell>
                          <Badge className={convo.satisfaction === 'High' ? 
                            'bg-gradient-to-r from-[hsla(120,70%,40%,0.8)] to-[hsla(120,70%,30%,0.8)] text-white' : 
                            'bg-gradient-to-r from-[hsla(30,14%,78%,1)] to-[hsla(34,98%,44%,1)] text-white'}>
                            {convo.satisfaction}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-white/70">{convo.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="satisfaction" className="space-y-4">
            <Card className="p-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg text-white">User Satisfaction Breakdown</h3>
                <p className="text-white/70">Based on post-conversation feedback and analysis</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut 
                    options={{
                      ...chartOptions,
                      cutout: '70%',
                    }} 
                    data={getUserSatisfactionData()} 
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/80">Main Factors Contributing to Satisfaction</p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-white flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Quick response time
                      </li>
                      <li className="text-white flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Accurate information
                      </li>
                      <li className="text-white flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Helpful suggestions
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-white/80">Areas for Improvement</p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-white flex items-center">
                        <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
                        Complex requests handling
                      </li>
                      <li className="text-white flex items-center">
                        <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
                        Multi-language support
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card className="p-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg text-white">Chatbot Performance Metrics</h3>
                <p className="text-white/70">Technical and operational metrics</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-white">Response Time</p>
                      <span className="text-xs text-white/70">Target: &lt;2s</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                      <span className="text-white font-medium">1.8s</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-white">Accuracy Rate</p>
                      <span className="text-xs text-white/70">Target: &gt;90%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <span className="text-white font-medium">92%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-2">                      <p className="text-sm font-medium text-white">Fallback Rate</p>
                      <span className="text-xs text-white/70">Target: &lt;10%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      <span className="text-white font-medium">15%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-white">Completion Rate</p>
                      <span className="text-xs text-white/70">Target: &gt;85%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                      <span className="text-white font-medium">88%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-3">Top Performing Features</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Room Service Requests</span>
                      <Badge className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">98% Success</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Wi-Fi Information</span>
                      <Badge className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">96% Success</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Check-out Procedures</span>
                      <Badge className="bg-gradient-to-r from-[hsla(279,34%,43%,1)] to-[hsla(248,79%,22%,1)] text-white">93% Success</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
