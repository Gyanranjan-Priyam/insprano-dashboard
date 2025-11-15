import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Calendar, 
  Settings,
  Bell,
  TrendingUp,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDashboardData, getUpcomingEvents } from "./actions";
import { DashboardStatsCards } from "./_components/dashboard-stats-cards";
import { MyRegistrations } from "./_components/my-registrations";
import { MyTeams } from "./_components/my-teams";
import { UpcomingEvents } from "./_components/upcoming-events";
import { RecentActivities } from "./_components/recent-activities";

export default async function UserDashboard() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch dashboard data
  const [dashboardResult, upcomingEventsResult] = await Promise.all([
    getUserDashboardData(),
    getUpcomingEvents(),
  ]);

  if (dashboardResult.status === "error") {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {dashboardResult.message}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { stats, participations, teamMemberships, teamLeaderships, recentActivities, user } = dashboardResult.data;
  const upcomingEvents = upcomingEventsResult.status === "success" ? upcomingEventsResult.data : [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
              <AvatarFallback className="text-sm sm:text-lg font-semibold">
                {getInitials(user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {getCurrentGreeting()}, {user.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome to your dashboard. Here's what's happening with your events.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/dashboard/settings">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/dashboard/events">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Browse Events</span>
                <span className="sm:hidden">Events</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Today is {format(new Date(), "EEEE, MMMM do, yyyy")}</span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <div className="flex items-center gap-1">
            <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Dashboard</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Dashboard Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Overview</h2>
        </div>
        <DashboardStatsCards stats={stats} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* My Registrations */}
          <MyRegistrations participations={participations} />
          
          {/* My Teams */}
          <MyTeams teamMemberships={teamMemberships || []} teamLeaderships={teamLeaderships || []} />
          
          {/* Upcoming Events */}
          <UpcomingEvents events={upcomingEvents} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 sm:space-y-8">
          {/* Recent Activities */}
          <RecentActivities activities={recentActivities} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/events">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse All Events
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/participate">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View My Registrations
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/teams">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Teams
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-sm break-all">{user.email}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-sm">
                  {format(new Date(), "MMMM yyyy")}
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full text-sm" asChild>
                  <Link href="/dashboard/settings">
                    Update Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Information */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-primary">Need Help?</h3>
            <p className="text-sm text-muted-foreground px-4">
              If you have any questions about events or need assistance, feel free to reach out to our support team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-2">
              <Link href="/dashboard/contact-support" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Contact Support
              </Link>
              <Link href="/dashboard/events-guidelines" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Event Guidelines
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}