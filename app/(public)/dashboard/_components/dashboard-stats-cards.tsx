"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  CheckCircle,
  Clock,
  IndianRupee,
  Users,
  Crown
} from "lucide-react";
import { DashboardStats } from "../actions";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-6">
      {/* Total Registrations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Registrations
          </CardTitle>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.totalRegistrations}</div>
          <p className="text-xs text-muted-foreground">
            Total events
          </p>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Pending
          </CardTitle>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-amber-600">
            {stats.pendingPayments}
          </div>
          <p className="text-xs text-muted-foreground">
            Payments
          </p>
        </CardContent>
      </Card>

      {/* Confirmed Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Confirmed
          </CardTitle>
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {stats.confirmedEvents}
          </div>
          <p className="text-xs text-muted-foreground">
            Events
          </p>
        </CardContent>
      </Card>

      {/* Teams Joined */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Teams Joined
          </CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {stats.teamsJoined}
          </div>
          <p className="text-xs text-muted-foreground">
            As member
          </p>
        </CardContent>
      </Card>

      {/* Teams Leading */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Teams Leading
          </CardTitle>
          <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">
            {stats.teamsLeading}
          </div>
          <p className="text-xs text-muted-foreground">
            As leader
          </p>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Total Spent
          </CardTitle>
          <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">
            {formatCurrency(stats.totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground">
            On events
          </p>
        </CardContent>
      </Card>
    </div>
  );
}