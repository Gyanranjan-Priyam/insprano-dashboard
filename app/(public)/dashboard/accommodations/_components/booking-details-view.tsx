"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Download,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface BookingDetailsViewProps {
  booking: {
    id: string;
    name: string;
    mobileNumber: string;
    whatsappNumber?: string | null;
    state: string;
    district: string;
    collegeName: string;
    collegeAddress: string;
    stayId: string;
    roomType: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfNights: number;
    totalStayPrice: number;
    selectedMeals: string[];
    totalMealPrice: number;
    totalPrice: number;
    transactionId?: string | null;
    paymentScreenshot?: string | null;
    upiId?: string | null;
    paymentStatus: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    originalTotalPrice?: number | null;
    originalTransactionId?: string | null;
    originalPaymentScreenshot?: string | null;
    originalPaymentStatus?: string | null;
    hasBeenModified?: boolean;
    paymentHistory?: {
      originalPayment: {
        totalStayPrice: number;
        totalMealPrice: number;
        totalAmount: number;
        transactionId: string | null;
        paymentScreenshot: string | null;
        paymentStatus: string;
        createdAt: Date;
      };
      hasAdditionalPayment: boolean;
      lastModified: Date;
    } | null;
  };
  userProfile: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export function BookingDetailsView({ booking, userProfile }: BookingDetailsViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEditBooking = () => {
    router.push(`/dashboard/accommodations/${userProfile?.id}/edit`);
  };

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

  return (
    <div className="space-y-6">
      {/* Booking Status Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Your accommodation booking has been confirmed. You can edit your stay details if needed.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Details
                </div>
                <Button variant="outline" size="sm" onClick={handleEditBooking}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Booking
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{booking.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{userProfile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.mobileNumber}</span>
                </div>
                {booking.whatsappNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.whatsappNumber} (WhatsApp)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.district}, {booking.state}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium">{booking.collegeName}</div>
                  <div className="text-sm text-muted-foreground">{booking.collegeAddress}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Accommodation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Room Type: {booking.roomType}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span className="font-medium">
                      {format(new Date(booking.checkInDate), "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span className="font-medium">
                      {format(new Date(booking.checkOutDate), "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Details */}
          {booking.selectedMeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  Selected Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {booking.selectedMeals.length} meal{booking.selectedMeals.length !== 1 ? 's' : ''} selected
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Original Payment Details */}
              {booking.paymentHistory && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Original Booking Payment
                      <Badge variant="outline" className="text-xs">
                        {format(booking.paymentHistory.originalPayment.createdAt, "MMM dd, yyyy")}
                      </Badge>
                    </div>
                    
                    <div className="pl-6 space-y-3 border-l-2 border-muted">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Payment Status:</span>
                        {getPaymentStatusBadge(booking.paymentHistory.originalPayment.paymentStatus)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Amount:</span>
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <IndianRupee className="w-3 h-3" />
                          {booking.paymentHistory.originalPayment.totalAmount}
                        </span>
                      </div>

                      {booking.paymentHistory.originalPayment.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-sm">Transaction ID:</span>
                          <span className="font-mono text-xs">{booking.paymentHistory.originalPayment.transactionId}</span>
                        </div>
                      )}
                      
                      {booking.paymentHistory.originalPayment.paymentScreenshot && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Payment Screenshot:</span>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            View Original Receipt
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.paymentHistory.hasAdditionalPayment && (
                    <Separator />
                  )}
                </>
              )}

              {/* Current/Additional Payment Details */}
              {booking.paymentHistory?.hasAdditionalPayment ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    Recent Edit / Additional Payment
                    <Badge variant="outline" className="text-xs">
                      {format(booking.paymentHistory.lastModified, "MMM dd, yyyy")}
                    </Badge>
                  </div>
                  
                  <div className="pl-6 space-y-3 border-l-2 border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Status:</span>
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Updated Amount:</span>
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <IndianRupee className="w-3 h-3" />
                        {booking.totalPrice}
                      </span>
                    </div>

                    {booking.totalPrice > (booking.paymentHistory.originalPayment.totalAmount || 0) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-600">Additional Amount:</span>
                        <span className="flex items-center gap-1 text-sm font-medium text-orange-600">
                          <IndianRupee className="w-3 h-3" />
                          {booking.totalPrice - (booking.paymentHistory.originalPayment.totalAmount || 0)}
                        </span>
                      </div>
                    )}

                    {booking.transactionId && booking.transactionId !== booking.paymentHistory.originalPayment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-sm">New Transaction ID:</span>
                        <span className="font-mono text-xs">{booking.transactionId}</span>
                      </div>
                    )}
                    
                    {booking.paymentScreenshot && booking.paymentScreenshot !== booking.paymentHistory.originalPayment.paymentScreenshot && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">New Payment Screenshot:</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          View New Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Show current payment details if no additional payment
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Payment Status:</span>
                    {getPaymentStatusBadge(booking.paymentStatus)}
                  </div>
                  
                  {booking.transactionId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-sm">{booking.transactionId}</span>
                    </div>
                  )}
                  
                  {booking.paymentScreenshot && (
                    <div className="flex justify-between items-center">
                      <span>Payment Screenshot:</span>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        View Receipt
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {booking.paymentStatus === "PENDING" && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    {booking.paymentHistory?.hasAdditionalPayment 
                      ? "Your additional payment is under verification. You will be notified once it's confirmed."
                      : "Your payment is under verification. You will be notified once it's confirmed."
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Booking Status */}
              <div className="flex justify-between items-center">
                <span>Status:</span>
                {getBookingStatusBadge(booking.status)}
              </div>

              <Separator />

              {/* Stay Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Stay Cost:</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {booking.totalStayPrice}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Meal Cost */}
              {booking.totalMealPrice > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Meals Cost:</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {booking.totalMealPrice}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.selectedMeals.length} meal{booking.selectedMeals.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="space-y-3">
                {booking.paymentHistory?.hasAdditionalPayment ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Amount:</span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {booking.paymentHistory.originalPayment.totalAmount}
                      </span>
                    </div>
                    
                    {booking.totalPrice > (booking.paymentHistory.originalPayment.totalAmount || 0) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-600">Additional Amount:</span>
                        <span className="text-orange-600 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {booking.totalPrice - (booking.paymentHistory.originalPayment.totalAmount || 0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Current Total:</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <IndianRupee className="w-5 h-5" />
                        {booking.totalPrice}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {booking.totalPrice}
                    </span>
                  </div>
                )}
              </div>

              {/* Booking Date */}
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Booked on: {format(new Date(booking.createdAt), "PPP")}
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(booking.updatedAt), "PPP")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}