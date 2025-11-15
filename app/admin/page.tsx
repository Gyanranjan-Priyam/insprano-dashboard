import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
   getDashboardStats, 
   getRecentEvents, 
   getRecentParticipations, 
   getEventStats, 
   getMonthlyStats 
} from "@/app/data/admin/dashboard";
import { DashboardStats } from "@/components/admin_components/dashboard/DashboardStats";
import { RecentEvents, RecentParticipations } from "@/components/admin_components/dashboard/RecentActivity";
import { EventAnalytics, MonthlyStats } from "@/components/admin_components/dashboard/EventAnalytics";
import { 
   CalendarPlusIcon, 
   UsersIcon, 
   CreditCardIcon, 
   SettingsIcon,
   BarChart3Icon,
   TrendingUpIcon
} from "lucide-react";

// Loading components
function StatsLoading() {
   return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
         {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20 sm:w-24" />
                  <Skeleton className="h-4 w-4 shrink-0" />
               </CardHeader>
               <CardContent>
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-2" />
                  <Skeleton className="h-3 w-24 sm:w-28" />
               </CardContent>
            </Card>
         ))}
      </div>
   );
}

function RecentActivityLoading() {
   return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
         {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
               <CardHeader>
                  <Skeleton className="h-5 sm:h-6 w-32 sm:w-36" />
                  <Skeleton className="h-4 w-40 sm:w-48" />
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex items-center space-x-3 sm:space-x-4">
                           <Skeleton className="h-10 sm:h-12 w-10 sm:w-12 rounded shrink-0" />
                           <div className="space-y-2 min-w-0 flex-1">
                              <Skeleton className="h-4 w-full max-w-xs" />
                              <Skeleton className="h-3 w-3/4 max-w-xs" />
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>
   );
}

function AnalyticsLoading() {
   return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
         {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
               <CardHeader>
                  <Skeleton className="h-5 sm:h-6 w-36 sm:w-44" />
                  <Skeleton className="h-4 w-44 sm:w-52" />
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-2 w-full" />
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>
   );
}

// Data fetching components
async function DashboardStatsSection() {
   const stats = await getDashboardStats();
   return <DashboardStats stats={stats} />;
}

async function RecentActivitySection() {
   const [recentEvents, recentParticipations] = await Promise.all([
      getRecentEvents(5),
      getRecentParticipations(8)
   ]);

   return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
         <RecentEvents events={recentEvents} />
         <RecentParticipations participations={recentParticipations} />
      </div>
   );
}

async function AnalyticsSection() {
   const [eventStats, monthlyStats] = await Promise.all([
      getEventStats(),
      getMonthlyStats()
   ]);

   return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
         <EventAnalytics events={eventStats} />
         <MonthlyStats monthlyData={monthlyStats} />
      </div>
   );
}

export default function AdminPage() {
   const quickActions = [
      {
         title: "Create Event",
         description: "Add a new event to the platform",
         href: "/admin/events/create",
         icon: CalendarPlusIcon,
         color: "bg-blue-500"
      },
      {
         title: "Manage Participants",
         description: "View and manage event registrations",
         href: "/admin/participants",
         icon: UsersIcon,
         color: "bg-green-500"
      },
      {
         title: "Payment Management",
         description: "Handle payment verifications",
         href: "/admin/payments",
         icon: CreditCardIcon,
         color: "bg-purple-500"
      },
      {
         title: "System Settings",
         description: "Configure platform settings",
         href: "/admin/settings",
         icon: SettingsIcon,
         color: "bg-gray-500"
      }
   ];

   return (
      <div className="space-y-8">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
               <p className="text-sm sm:text-base text-muted-foreground">
                  Welcome back! Here's what's happening with your events platform.
               </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
               <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/admin/events">
                     <BarChart3Icon className="w-4 h-4 mr-2" />
                     View Events
                  </Link>
               </Button>
               <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/events/create">
                     <CalendarPlusIcon className="w-4 h-4 mr-2" />
                     Create Event
                  </Link>
               </Button>
            </div>
         </div>

         {/* Quick Actions */}
         <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
               const Icon = action.icon;
               return (
                  <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                     <Link href={action.href} className="block h-full">
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                           <div className={`${action.color} p-2 rounded-lg mr-3 shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <CardTitle className="text-sm font-medium truncate">
                                 {action.title}
                              </CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                           <CardDescription className="text-xs leading-relaxed">
                              {action.description}
                           </CardDescription>
                        </CardContent>
                     </Link>
                  </Card>
               );
            })}
         </div>

         {/* Dashboard Stats */}
         <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
               <TrendingUpIcon className="w-5 h-5 shrink-0" />
               <h2 className="text-xl sm:text-2xl font-semibold">Platform Overview</h2>
            </div>
            <Suspense fallback={<StatsLoading />}>
               <DashboardStatsSection />
            </Suspense>
         </div>

         {/* Recent Activity */}
         <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Recent Activity</h2>
            <Suspense fallback={<RecentActivityLoading />}>
               <RecentActivitySection />
            </Suspense>
         </div>

         {/* Analytics */}
         <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Analytics & Insights</h2>
            <Suspense fallback={<AnalyticsLoading />}>
               <AnalyticsSection />
            </Suspense>
         </div>
      </div>
   );
}
