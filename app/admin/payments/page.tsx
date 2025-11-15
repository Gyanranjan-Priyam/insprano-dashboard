import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCardIcon,
  BuildingIcon,
  Users,
} from "lucide-react";
import { getAllEventPayments, getAllAccommodationPayments, getPaymentStatistics } from "./actions";
import { PaymentTable } from "@/app/admin/payments/_components/payment-table";
import { AccommodationPaymentTable } from "@/app/admin/payments/_components/accommodation-payment-table";
import { TeamPaymentTable } from "@/app/admin/payments/_components/team-payment-table";


export default async function PaymentsPage() {
  const [
    { data: eventPayments = [], error: eventError },
    { data: accommodationPayments = [], error: accommodationError },
    { data: stats }
  ] = await Promise.all([
    getAllEventPayments(),
    getAllAccommodationPayments(),
    getPaymentStatistics()
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-nova-square">Payment Management</h1>
          <p className="text-sm mt-2 md:text-base text-muted-foreground">
            Track and manage payments from participants who have submitted payment details
          </p>
        </div>
      </div>

      {/* Payment Statistics */}
      {stats && (
        <div className="space-y-4">
          {/* Overall Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Payments</CardTitle>
                <CreditCardIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stats.totalPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Confirmed/Verified</CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stats.confirmedPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stats.pendingPayments}</div>
              </CardContent>
            </Card>
            <Card className="col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Revenue</CardTitle>
                <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCardIcon className="h-4 w-4" />
                  Event Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{stats.eventPayments.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Confirmed:</span>
                  <span className="font-medium text-green-600">{stats.eventPayments.confirmed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium text-orange-600">{stats.eventPayments.pending}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Revenue:</span>
                  <span>{formatCurrency(stats.eventPayments.revenue)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  Accommodation Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{stats.accommodationPayments.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Verified:</span>
                  <span className="font-medium text-green-600">{stats.accommodationPayments.verified}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium text-orange-600">{stats.accommodationPayments.pending}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Revenue:</span>
                  <span>{formatCurrency(stats.accommodationPayments.revenue)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Tabs defaultValue="events" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="events" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <CreditCardIcon className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Events Payments</span>
            <span className="sm:hidden">Events</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Team Payments</span>
            <span className="sm:hidden">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="accommodation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <BuildingIcon className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Accommodation Payments</span>
            <span className="sm:hidden">Accommodation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4 mt-4">
          <PaymentTable payments={eventPayments} error={eventError} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4 mt-4">
          <TeamPaymentTable payments={eventPayments} error={eventError} />
        </TabsContent>

        <TabsContent value="accommodation" className="space-y-4 mt-4">
          <AccommodationPaymentTable payments={accommodationPayments} error={accommodationError} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
