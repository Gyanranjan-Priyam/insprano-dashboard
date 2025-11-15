import { getUserProfile, getUserAccommodationBooking, getAvailableStays, getFoodsForDays } from "./[userId]/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CalendarDays,
  MapPin, 
  User, 
  Phone, 
  Mail,
  Building,
  Hotel,
  UtensilsCrossed,
  IndianRupee,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// Updated: November 9, 2025 - Fixed routing issues
export default async function AccommodationsPage() {
  // Get current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user profile
  const userProfileResult = await getUserProfile();
  if (userProfileResult.status !== "success" || !userProfileResult.data) {
    redirect("/login");
  }

  // Check if user has a booking
  const existingBookingResult = await getUserAccommodationBooking();
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Booking data is already serialized in the action
  const serializedBooking = existingBookingResult.status === "success" && existingBookingResult.data 
    ? existingBookingResult.data
    : null;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Accommodation Bookings</h1>
              <p className="text-muted-foreground">
                View and manage your accommodation reservations
              </p>
            </div>
            {!serializedBooking && (
              <Link href={`/dashboard/accommodations/${userProfileResult.data.id}`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Booking Status Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              Your Bookings
            </CardTitle>
            <CardDescription>
              {serializedBooking ? "Your current accommodation booking details" : "You don't have any accommodation bookings yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serializedBooking ? (
              <div className="space-y-6">
                {/* Booking Overview Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Booking ID</TableCell>
                      <TableCell className="font-mono text-sm">{serializedBooking.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell>{getBookingStatusBadge(serializedBooking.status)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Guest Name</TableCell>
                      <TableCell>{serializedBooking.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mobile Number</TableCell>
                      <TableCell>{serializedBooking.mobileNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Check-in Date</TableCell>
                      <TableCell>{format(new Date(serializedBooking.checkInDate), "PPP")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Check-out Date</TableCell>
                      <TableCell>{format(new Date(serializedBooking.checkOutDate), "PPP")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Duration</TableCell>
                      <TableCell>{serializedBooking.numberOfNights} night{serializedBooking.numberOfNights !== 1 ? 's' : ''}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Room Type</TableCell>
                      <TableCell>{serializedBooking.roomType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Location</TableCell>
                      <TableCell>{serializedBooking.district}, {serializedBooking.state}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">College</TableCell>
                      <TableCell>{serializedBooking.collegeName}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Pricing Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IndianRupee className="w-5 h-5" />
                        Pricing Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Stay Cost</TableCell>
                            <TableCell className="text-right">₹{serializedBooking.totalStayPrice}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Meals Cost</TableCell>
                            <TableCell className="text-right">₹{serializedBooking.totalMealPrice}</TableCell>
                          </TableRow>
                          <TableRow className="border-t font-semibold">
                            <TableCell>Total Amount</TableCell>
                            <TableCell className="text-right text-green-600">₹{serializedBooking.totalPrice}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Payment Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Payment Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Payment Status</TableCell>
                            <TableCell className="text-right">{getPaymentStatusBadge(serializedBooking.paymentStatus)}</TableCell>
                          </TableRow>
                          {serializedBooking.transactionId && (
                            <TableRow>
                              <TableCell className="font-medium">Transaction ID</TableCell>
                              <TableCell className="text-right font-mono text-sm">{serializedBooking.transactionId}</TableCell>
                            </TableRow>
                          )}
                          {serializedBooking.upiId && (
                            <TableRow>
                              <TableCell className="font-medium">UPI ID</TableCell>
                              <TableCell className="text-right">{serializedBooking.upiId}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="font-medium">Booking Date</TableCell>
                            <TableCell className="text-right">{format(new Date(serializedBooking.createdAt), "PPP")}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Meal Details */}
                {serializedBooking.selectedMeals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5" />
                        Meal Selections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {serializedBooking.selectedMeals.length} meal{serializedBooking.selectedMeals.length !== 1 ? 's' : ''} selected
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <Link href={`/dashboard/accommodations/${userProfileResult.data.id}`}>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/accommodations/${userProfileResult.data.id}/stay-selection`}>
                    <Button>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Booking
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* No Booking State */
              <div className="text-center py-12">
                <Hotel className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Accommodation Bookings</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't made any accommodation bookings yet. Start by creating your first booking.
                </p>
                <Link href={`/dashboard/accommodations/${userProfileResult.data.id}`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Booking
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}