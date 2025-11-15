"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    CalendarIcon, 
    UsersIcon, 
    TrendingUpIcon, 
    IndianRupeeIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    AlertCircleIcon
} from "lucide-react";

interface DashboardStatsProps {
    stats: {
        totalEvents: number;
        totalUsers: number;
        totalParticipations: number;
        totalTeams: number;
        recentRegistrations: number;
        totalRevenue: number;
        pendingPayments: number;
        participationStats: Record<string, number>;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const statCards = [
        {
            title: "Total Events",
            value: stats.totalEvents,
            description: "Active events",
            icon: CalendarIcon,
            color: "text-blue-600"
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            description: "Registered users",
            icon: UsersIcon,
            color: "text-green-600"
        },
        {
            title: "Total Registrations",
            value: stats.totalParticipations,
            description: "All-time registrations",
            icon: TrendingUpIcon,
            color: "text-purple-600"
        },
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            description: "From confirmed payments",
            icon: IndianRupeeIcon,
            color: "text-emerald-600"
        },
        {
            title: "Recent Registrations",
            value: stats.recentRegistrations,
            description: "Last 30 days",
            icon: TrendingUpIcon,
            color: "text-orange-600"
        },
        {
            title: "Pending Payments",
            value: stats.pendingPayments,
            description: "Awaiting verification",
            icon: ClockIcon,
            color: "text-yellow-600"
        }
    ];

    const getStatusBadge = (status: string, count: number) => {
        const statusConfig = {
            REGISTERED: { label: "Registered", variant: "secondary" as const, icon: UsersIcon },
            PENDING_PAYMENT: { label: "Pending Payment", variant: "destructive" as const, icon: AlertCircleIcon },
            PAYMENT_SUBMITTED: { label: "Payment Submitted", variant: "default" as const, icon: ClockIcon },
            CONFIRMED: { label: "Confirmed", variant: "default" as const, icon: CheckCircleIcon },
            CANCELLED: { label: "Cancelled", variant: "secondary" as const, icon: XCircleIcon }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) return null;

        const Icon = config.icon;

        return (
            <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium truncate">{config.label}</span>
                </div>
                <Badge variant={config.variant} className="shrink-0">{count}</Badge>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color} shrink-0`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold wrap-break-word">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}