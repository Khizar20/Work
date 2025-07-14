'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Activity,
  Users,
  Clock,
  Smile,
  ArrowUp,
  ArrowDown,
  Loader2,
  MessageSquare,
  Tag
} from 'lucide-react';
import { Button } from '../components/ui/button';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeRange, setActiveTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    activeChats: 34,
    roomBookings: 83,
    responseTime: 12,  // seconds
    satisfactionScore: 4.7,
    activeChatsChange: '+12%',
    roomBookingsChange: '+5%',
    responseTimeChange: '-8%',
    satisfactionScoreChange: '+2%',
  });

  // Top inquiries data
  const [topInquiries, setTopInquiries] = useState([
    { id: 1, category: 'Room Service', count: 156, trend: '+12%', color: 'bg-blue-100 text-blue-800' },
    { id: 2, category: 'Wi-Fi Access', count: 129, trend: '+8%', color: 'bg-green-100 text-green-800' },
    { id: 3, category: 'Check Out Process', count: 98, trend: '-3%', color: 'bg-amber-100 text-amber-800' },
    { id: 4, category: 'Housekeeping', count: 89, trend: '+15%', color: 'bg-purple-100 text-purple-800' },
    { id: 5, category: 'Restaurant Hours', count: 72, trend: '+4%', color: 'bg-pink-100 text-pink-800' },
  ]);

  // Mocked chart data
  const getChartData = (timeRange: string) => {
    let labels: string[] = [];
    let data: number[] = [];

    switch(timeRange) {
      case '7d':
        labels = ['Jun 1', 'Jun 2', 'Jun 3', 'Jun 4', 'Jun 5', 'Jun 6', 'Jun 7'];
        data = [65, 59, 80, 81, 56, 75, 82];
        break;
      case '30d':
        labels = Array.from({length: 30}, (_, i) => `May ${i+8}`)
          .concat(Array.from({length: 7}, (_, i) => `Jun ${i+1}`));
        data = Array.from({length: 37}, () => Math.floor(Math.random() * 50) + 40);
        break;
      case '90d':
        labels = ['Mar', 'Apr', 'May', 'Jun'];
        data = [240, 320, 280, 350];
        break;
      default:
        labels = ['Jun 1', 'Jun 2', 'Jun 3', 'Jun 4', 'Jun 5', 'Jun 6', 'Jun 7'];
        data = [65, 59, 80, 81, 56, 75, 82];
    }

    return {
      labels,
      datasets: [
        {
          label: 'Chat Volume',
          data,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            return `Chat Volume: ${context.raw}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
          },
        },
      },
    },
  };

  useEffect(() => {
    // Simulate API fetch for data
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch data from your API here
        // For now, we'll just use our mock data already set in state
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Calculate trend icon and color
  const getTrendIndicator = (trendValue: string) => {
    const isPositive = trendValue.startsWith('+');
    
    return {
      icon: isPositive ? 
        <ArrowUp className="w-3 h-3" /> : 
        <ArrowDown className="w-3 h-3" />,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  // Metrics card data
  const metricsCards = [
    {
      title: 'Active Chats',
      value: metrics.activeChats,
      trend: metrics.activeChatsChange,
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Real-time AI conversations'
    },
    {
      title: 'Room Bookings',
      value: metrics.roomBookings,
      trend: metrics.roomBookingsChange,
      icon: <Users className="w-4 h-4" />,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Total active reservations'
    },
    {
      title: 'Response Time',
      value: `${metrics.responseTime}s`,
      trend: metrics.responseTimeChange,
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-amber-50',
      iconColor: 'text-amber-600',
      description: 'Average chatbot response'
    },
    {
      title: 'Satisfaction',
      value: metrics.satisfactionScore,
      trend: metrics.satisfactionScoreChange,
      icon: <Smile className="w-4 h-4" />,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'User rating (out of 5)'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          
          <div className="flex items-center">
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500 mr-4">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Refreshing...
              </div>
            )}
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricsCards.map((card, index) => {
            const { icon: TrendIcon, color: trendColor } = getTrendIndicator(card.trend);
            
            return (
              <Card key={index} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.color} p-2 rounded-md`}>
                    <span className={card.iconColor}>{card.icon}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="flex items-center pt-1">
                    <span className={`flex items-center text-xs ${trendColor}`}>
                      {TrendIcon}
                      <span className="ml-0.5">{card.trend}</span>
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      from last week
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chat Volume Chart */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chat Volume</CardTitle>
                  <CardDescription>
                    Total AI conversations over time
                  </CardDescription>
                </div>
                <Tabs defaultValue="7d" value={activeTimeRange} onValueChange={setActiveTimeRange}>
                  <TabsList className="grid grid-cols-3 w-[180px]">
                    <TabsTrigger value="7d">7D</TabsTrigger>
                    <TabsTrigger value="30d">30D</TabsTrigger>
                    <TabsTrigger value="90d">90D</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[350px] p-6 pt-0">
                <Line options={chartOptions} data={getChartData(activeTimeRange)} />
              </div>
            </CardContent>
          </Card>

          {/* Top Inquiries */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Inquiries</CardTitle>
              <CardDescription>
                30-day most common requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <div className="font-medium">{inquiry.category}</div>
                        <div className="text-sm text-gray-500">{inquiry.count} requests</div>
                      </div>
                    </div>
                    <Badge className={inquiry.color}>{inquiry.trend}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}