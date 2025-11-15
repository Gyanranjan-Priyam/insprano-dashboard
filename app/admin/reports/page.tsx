import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTeamsReportData,
  getPaymentsReportData,
  getParticipantsReportData,
} from "./actions";
import { TeamsTable } from "./_components/teams-table";
import { PaymentsTable } from "./_components/payments-table";
import { ParticipantsTable } from "./_components/participants-table";
import { CombinedExportButton } from "./_components/combined-export-button";
import { Users, CreditCard, Users2, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Loading components
function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-md">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Data fetching components
async function TeamsReport() {
  const result = await getTeamsReportData();
  
  if (result.status === "error") {
    return (
      <div className="p-8 text-center text-red-600">
        Error: {result.message}
      </div>
    );
  }

  if (!result.data || result.data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No teams data available.
      </div>
    );
  }

  return <TeamsTable teams={result.data} />;
}

async function PaymentsReport() {
  const result = await getPaymentsReportData();
  
  if (result.status === "error") {
    return (
      <div className="p-8 text-center text-red-600">
        Error: {result.message}
      </div>
    );
  }

  if (!result.data || result.data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No payments data available.
      </div>
    );
  }

  return <PaymentsTable payments={result.data} />;
}

async function ParticipantsReport() {
  const result = await getParticipantsReportData();
  
  if (result.status === "error") {
    return (
      <div className="p-8 text-center text-red-600">
        Error: {result.message}
      </div>
    );
  }

  if (!result.data || result.data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No participants data available.
      </div>
    );
  }

  return <ParticipantsTable participants={result.data} />;
}

// Quick stats component
async function QuickStats() {
  const [teamsResult, paymentsResult, participantsResult] = await Promise.all([
    getTeamsReportData(),
    getPaymentsReportData(),
    getParticipantsReportData(),
  ]);

  const teamsCount = teamsResult.data?.length || 0;
  const paymentsCount = paymentsResult.data?.length || 0;
  const participantsCount = participantsResult.data?.length || 0;
  const totalRevenue = paymentsResult.data?.reduce((sum, payment) => sum + payment.paymentAmount, 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamsCount}</div>
          <p className="text-xs text-muted-foreground">
            Registered teams
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{participantsCount}</div>
          <p className="text-xs text-muted-foreground">
            Registered users
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paymentsCount}</div>
          <p className="text-xs text-muted-foreground">
            Payment transactions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total collected
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Reports"
          description="Comprehensive reports on teams, payments, and participants." 
          showBackButton={false}/>
        <CombinedExportButton />
      </div>
      <Separator />

      
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <QuickStats />
      </Suspense>

      <Tabs defaultValue="teams" className="space-y-6 ">
        <TabsList className="grid w-full grid-cols-3 h-15">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Teams Report</CardTitle>
              <CardDescription>
                View and analyze all team registrations, their payment status, and member counts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TableSkeleton />}>
                <TeamsReport />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments Report</CardTitle>
              <CardDescription>
                Track all payment transactions including event registrations and accommodation bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TableSkeleton />}>
                <PaymentsReport />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Participants Report</CardTitle>
              <CardDescription>
                Comprehensive overview of all registered participants, their activity, and engagement levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TableSkeleton />}>
                <ParticipantsReport />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
