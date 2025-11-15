"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity,
  Calendar,
  CreditCard,
  CheckCircle,
  Users,
  Clock,
  Crown,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { RecentActivity } from "../actions";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'registration':
        return <Calendar className="w-4 h-4" />;
      case 'payment_submitted':
        return <CreditCard className="w-4 h-4" />;
      case 'payment_verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'team_joined':
        return <UserPlus className="w-4 h-4" />;
      case 'team_created':
        return <Crown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'registration':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'payment_submitted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'payment_verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'team_joined':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'team_created':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return format(new Date(date), "MMM dd, yyyy");
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activities
          </CardTitle>
          <CardDescription>
            Your latest actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recent activities</h3>
            <p className="text-muted-foreground">
              Your activities will appear here as you interact with events and teams.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          Recent Activities
        </CardTitle>
        <CardDescription className="text-sm">
          Your latest actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-4">
          <div className="space-y-3 sm:space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="shrink-0 mt-1">
                  <Badge className={getActivityColor(activity.type)} variant="outline">
                    {getActivityIcon(activity.type)}
                  </Badge>
                </div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-1 sm:space-y-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-medium truncate">{activity.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 sm:ml-2">
                      {formatRelativeTime(activity.date)}
                    </span>
                  </div>
                  
                  {activity.eventTitle && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <Badge variant="secondary" className="text-xs w-fit">
                        <span className="truncate">{activity.eventTitle}</span>
                      </Badge>
                      {activity.teamName && (
                        <Badge variant="outline" className="text-xs w-fit">
                          Team: <span className="truncate">{activity.teamName}</span>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}