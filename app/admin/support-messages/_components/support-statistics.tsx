"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TicketIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  TrendingUpIcon
} from "lucide-react";
import { getSupportStatistics } from "../actions";

interface SupportStats {
  totalTickets: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  recentTickets: number;
}

export default function SupportStatistics() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getSupportStatistics();
        if (result.status === "success") {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 sm:w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statusConfig = {
    OPEN: { icon: ClockIcon, color: "text-blue-600", bgColor: "bg-blue-100" },
    IN_PROGRESS: { icon: AlertTriangleIcon, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    RESOLVED: { icon: CheckCircleIcon, color: "text-green-600", bgColor: "bg-green-100" },
    CLOSED: { icon: XCircleIcon, color: "text-gray-600", bgColor: "bg-gray-100" },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Total Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <TicketIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.totalTickets}</div>
          <p className="text-xs text-muted-foreground">
            All time tickets
          </p>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent (24h)</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.recentTickets}</div>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
          </p>
        </CardContent>
      </Card>

      {/* Open Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          <ClockIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {stats.statusCounts.OPEN || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting response
          </p>
        </CardContent>
      </Card>

      {/* In Progress Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">
            {stats.statusCounts.IN_PROGRESS || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Being handled
          </p>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card className="sm:col-span-2 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Object.entries(stats.statusCounts).map(([status, count]) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              if (!config) return null;

              const percentage = stats.totalTickets > 0 ? (count / stats.totalTickets * 100).toFixed(1) : '0';

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-full ${config.bgColor}`}>
                      <config.icon className={`h-3 w-3 ${config.color}`} />
                    </div>
                    <span className="text-sm">{status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">{count}</Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority Overview */}
      <Card className="sm:col-span-2 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Object.entries(stats.priorityCounts)
              .sort(([a], [b]) => {
                const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                return order[a as keyof typeof order] - order[b as keyof typeof order];
              })
              .map(([priority, count]) => {
                const priorityColors = {
                  URGENT: "text-red-600 bg-red-100",
                  HIGH: "text-orange-600 bg-orange-100", 
                  MEDIUM: "text-yellow-600 bg-yellow-100",
                  LOW: "text-green-600 bg-green-100",
                };

                const percentage = stats.totalTickets > 0 ? (count / stats.totalTickets * 100).toFixed(1) : '0';

                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${priorityColors[priority as keyof typeof priorityColors]}`}
                      >
                        {priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}