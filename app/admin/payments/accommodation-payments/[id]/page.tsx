import { getAccommodationPaymentById } from "../../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon, 
  MailIcon, 
  MapIcon, 
  SchoolIcon, 
  FileImageIcon,
  CreditCardIcon,
  BedIcon,
  UtensilsCrossedIcon,
  IndianRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  BuildingIcon
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AccommodationPaymentStatusUpdateForm } from "./_components/accommodation-payment-status-update-form";
import { AccommodationPaymentImage } from "./_components/accommodation-payment-image";
import { PageHeader } from "@/components/ui/page-header";

interface AccommodationPaymentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccommodationPaymentDetailPage({ params }: AccommodationPaymentDetailPageProps) {
  const { id } = await params;
  const result = await getAccommodationPaymentById(id);

  if (result.status === "error") {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Accommodation Payment Details</h1>
          <div className="text-red-600 text-sm md:text-base">{result.message}</div>
          <Link href="/admin/payments" className="inline-block mt-4">
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const booking = result.data;
  
  if (!booking) {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Accommodation Payment Details</h1>
          <div className="text-red-600 text-sm md:text-base">Booking record not found</div>
          <Link href="/admin/payments" className="inline-block mt-4">
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircleIcon className="w-4 h-4" />;
      case 'PENDING': return <AlertCircleIcon className="w-4 h-4" />;
      case 'FAILED': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getS3Url = (key: string) => {
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
    return `https://${bucketName}.t3.storage.dev/${key}`;
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "PPP");
  };

  const formatDateTime = (date: Date | string) => {
    return format(new Date(date), "PPP 'at' p");
  };

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4">
      <PageHeader
        title="Accommodation Booking Details"
        description={`Complete booking information for ${booking.name}`}
        showBreadcrumbs={true}
        backButtonProps={{
          fallbackUrl: "/admin/payments",
          label: "Back to Payments"
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Details */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          {/* Guest Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto sm:mx-0">
                  <AvatarImage src={booking.user.image || ""} />
                  <AvatarFallback className="text-lg md:text-xl">
                    {booking.user.name?.charAt(0) || booking.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-semibold">{booking.name}</h3>
                  <p className="text-sm md:text-base text-muted-foreground break-all">{booking.user.email}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    User since {format(new Date(booking.user.createdAt || new Date()), "MMMM yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <MailIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm md:text-base break-all">{booking.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm md:text-base">{booking.mobileNumber}</span>
                </div>
                {booking.whatsappNumber && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm md:text-base">WhatsApp: {booking.whatsappNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-sm md:text-base font-medium">State</label>
                  <p className="text-sm md:text-base text-muted-foreground">{booking.state}</p>
                </div>
                <div>
                  <label className="text-sm md:text-base font-medium">District</label>
                  <p className="text-sm md:text-base text-muted-foreground">{booking.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <SchoolIcon className="w-4 h-4 md:w-5 md:h-5" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm md:text-base font-medium">College Name</label>
                  <p className="text-sm md:text-base text-muted-foreground wrap-break-word">{booking.collegeName}</p>
                </div>
                <div>
                  <label className="text-sm md:text-base font-medium">College Address</label>
                  <p className="text-sm md:text-base text-muted-foreground wrap-break-word">{booking.collegeAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <BedIcon className="w-4 h-4 md:w-5 md:h-5" />
                Accommodation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm md:text-base font-medium">Room Type</label>
                    <p className="text-lg font-semibold text-purple-600">{booking.roomType}</p>
                  </div>
                  <div>
                    <label className="text-sm md:text-base font-medium">Number of Nights</label>
                    <p className="text-lg font-semibold">{booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm md:text-base font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-green-600" />
                      Check-in Date
                    </label>
                    <p className="text-base font-semibold text-green-600">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm md:text-base font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-red-600" />
                      Check-out Date
                    </label>
                    <p className="text-base font-semibold text-red-600">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>

                {booking.selectedMeals.length > 0 && (
                  <div>
                    <label className="text-sm md:text-base font-medium flex items-center gap-2 mb-2">
                      <UtensilsCrossedIcon className="w-4 h-4" />
                      Selected Meals ({booking.selectedMeals.length})
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {booking.selectedMeals.length} meal{booking.selectedMeals.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <IndianRupeeIcon className="w-4 h-4 md:w-5 md:h-5" />
                Pricing Breakdown
              </CardTitle>
              {booking.paymentHistory?.hasAdditionalPayment && (
                <CardDescription>
                  Pricing has been updated after the original booking
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Pricing */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Current Pricing</div>
                  <div className="space-y-2 pl-4 border-l-2 border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm md:text-base">Stay Cost ({booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''})</span>
                      <span className="font-semibold">{formatCurrency(booking.totalStayPrice)}</span>
                    </div>
                    {booking.totalMealPrice > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm md:text-base">Meal Cost ({booking.selectedMeals.length} meal{booking.selectedMeals.length > 1 ? 's' : ''})</span>
                        <span className="font-semibold">{formatCurrency(booking.totalMealPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Current Total</span>
                      <span className="font-bold text-green-600">{formatCurrency(booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Original Pricing (if different) */}
                {booking.paymentHistory?.hasAdditionalPayment && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Original Pricing</div>
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Original Amount</span>
                        <span className="font-semibold">{formatCurrency(booking.paymentHistory.originalPayment.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-orange-600">
                        <span className="text-sm font-medium">Additional Amount</span>
                        <span className="font-semibold">
                          {formatCurrency(booking.totalPrice - booking.paymentHistory.originalPayment.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Status and Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <CreditCardIcon className="w-4 h-4 md:w-5 md:h-5" />
                Payment Status & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm md:text-base font-medium">Payment Status</label>
                <Badge className={`${getPaymentStatusColor(booking.paymentStatus)} flex items-center gap-1 w-fit mt-1 text-xs md:text-sm`}>
                  {getPaymentStatusIcon(booking.paymentStatus)}
                  {booking.paymentStatus}
                </Badge>
              </div>

              <div>
                <label className="text-sm md:text-base font-medium">Booking Status</label>
                <Badge className={`${getBookingStatusColor(booking.status)} block w-fit mt-1 text-xs md:text-sm`}>
                  {booking.status}
                </Badge>
              </div>

              <Separator />

              <AccommodationPaymentStatusUpdateForm 
                bookingId={booking.id} 
                currentPaymentStatus={booking.paymentStatus}
                currentBookingStatus={booking.status}
              />
            </CardContent>
          </Card>

          {/* Booking Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg lg:text-xl">Booking Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm md:text-base">
                <div>
                  <label className="font-medium">Booking Created:</label>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Last Updated:</label>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {formatDateTime(booking.updatedAt)}
                  </p>
                </div>
                {booking.verifiedAt && (
                  <div>
                    <label className="font-medium">Payment Verified:</label>
                    <p className="text-green-600 text-xs md:text-sm">
                      {formatDateTime(booking.verifiedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg lg:text-xl">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Payment Summary */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm md:text-base font-medium">Current Total Amount</label>
                  <p className="text-lg md:text-xl font-semibold text-green-600">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
                
                {booking.paymentHistory?.hasAdditionalPayment && (
                  <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Amount:</span>
                      <span className="font-medium">{formatCurrency(booking.paymentHistory.originalPayment.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600 font-medium">Additional Amount:</span>
                      <span className="text-orange-600 font-semibold">
                        {formatCurrency(booking.totalPrice - booking.paymentHistory.originalPayment.totalAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                {booking.transactionId && (
                  <div>
                    <label className="text-sm md:text-base font-medium">
                      {booking.paymentHistory?.hasAdditionalPayment ? "Latest Transaction ID" : "Transaction ID"}
                    </label>
                    <p className="text-xs md:text-sm text-muted-foreground font-mono break-all">
                      {booking.transactionId}
                    </p>
                  </div>
                )}
                
                {booking.paymentHistory?.hasAdditionalPayment && 
                 booking.paymentHistory.originalPayment.transactionId &&
                 booking.transactionId !== booking.paymentHistory.originalPayment.transactionId && (
                  <div>
                    <label className="text-sm md:text-base font-medium">Original Transaction ID</label>
                    <p className="text-xs md:text-sm text-muted-foreground font-mono break-all">
                      {booking.paymentHistory.originalPayment.transactionId}
                    </p>
                  </div>
                )}
                
                {booking.upiId && (
                  <div>
                    <label className="text-sm md:text-base font-medium">UPI ID</label>
                    <p className="text-xs md:text-sm text-muted-foreground break-all">
                      {booking.upiId}
                    </p>
                  </div>
                )}
                
                {booking.verifiedBy && (
                  <div>
                    <label className="text-sm md:text-base font-medium">Verified By</label>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Admin ID: {booking.verifiedBy}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Timeline */}
              {booking.paymentHistory && (
                <div className="space-y-3 pt-3 border-t">
                  <label className="text-sm md:text-base font-medium">Payment Timeline</label>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Payment:</span>
                      <span>{format(booking.paymentHistory.originalPayment.createdAt, "MMM dd, yyyy")}</span>
                    </div>
                    {booking.paymentHistory.hasAdditionalPayment && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Update:</span>
                        <span>{format(booking.paymentHistory.lastModified, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {booking.verifiedAt && (
                      <div className="flex justify-between text-green-600">
                        <span>Verified:</span>
                        <span>{format(booking.verifiedAt, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Screenshot */}
          {booking.paymentHistory && booking.paymentHistory.screenshots.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                  <FileImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Payment History & Screenshots
                </CardTitle>
                <CardDescription>
                  {booking.paymentHistory.hasAdditionalPayment 
                    ? "All payment screenshots uploaded by the user including original and additional payments"
                    : "Original payment screenshot uploaded by the user"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Original Payment Screenshot */}
                {booking.paymentHistory.originalPayment.paymentScreenshot && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ClockIcon className="w-4 h-4" />
                      Original Payment
                      <Badge variant="outline" className="text-xs">
                        {format(booking.paymentHistory.originalPayment.createdAt, "MMM dd, yyyy 'at' h:mm a")}
                      </Badge>
                    </div>
                    <div className="pl-6 border-l-2 border-muted space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">Amount:</span>
                        <span className="text-green-600 font-semibold">{formatCurrency(booking.paymentHistory.originalPayment.totalAmount)}</span>
                        {booking.paymentHistory.originalPayment.transactionId && (
                          <>
                            <span className="font-medium">Transaction ID:</span>
                            <span className="font-mono text-xs break-all">{booking.paymentHistory.originalPayment.transactionId}</span>
                          </>
                        )}
                        <span className="font-medium">Status:</span>
                        <Badge className={`${getPaymentStatusColor(booking.paymentHistory.originalPayment.paymentStatus)} w-fit text-xs`}>
                          {booking.paymentHistory.originalPayment.paymentStatus}
                        </Badge>
                      </div>
                      <AccommodationPaymentImage
                        src={getS3Url(booking.paymentHistory.originalPayment.paymentScreenshot)}
                        alt="Original Payment Screenshot"
                        className="w-full max-w-md rounded-lg border"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Payment Screenshot */}
                {booking.paymentHistory.hasAdditionalPayment && 
                 booking.paymentScreenshot && 
                 booking.paymentScreenshot !== booking.paymentHistory.originalPayment.paymentScreenshot && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <AlertCircleIcon className="w-4 h-4 text-orange-500" />
                      Additional Payment / Booking Update
                      <Badge variant="outline" className="text-xs">
                        {format(booking.paymentHistory.lastModified, "MMM dd, yyyy 'at' h:mm a")}
                      </Badge>
                    </div>
                    <div className="pl-6 border-l-2 border-orange-200 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">Updated Amount:</span>
                        <span className="text-green-600 font-semibold">{formatCurrency(booking.totalPrice)}</span>
                        {booking.totalPrice > booking.paymentHistory.originalPayment.totalAmount && (
                          <>
                            <span className="font-medium text-orange-600">Additional:</span>
                            <span className="text-orange-600 font-semibold">
                              {formatCurrency(booking.totalPrice - booking.paymentHistory.originalPayment.totalAmount)}
                            </span>
                          </>
                        )}
                        {booking.transactionId && booking.transactionId !== booking.paymentHistory.originalPayment.transactionId && (
                          <>
                            <span className="font-medium">New Transaction ID:</span>
                            <span className="font-mono text-xs break-all">{booking.transactionId}</span>
                          </>
                        )}
                        <span className="font-medium">Current Status:</span>
                        <Badge className={`${getPaymentStatusColor(booking.paymentStatus)} w-fit text-xs`}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                      <AccommodationPaymentImage
                        src={getS3Url(booking.paymentScreenshot)}
                        alt="Additional Payment Screenshot"
                        className="w-full max-w-md rounded-lg border"
                      />
                    </div>
                  </div>
                )}

                {/* All Screenshots Gallery */}
                {booking.paymentHistory.screenshots.length > 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileImageIcon className="w-4 h-4" />
                      All Payment Screenshots ({booking.paymentHistory.screenshots.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.paymentHistory.screenshots.map((screenshot, index) => (
                        <div key={index} className="space-y-2">
                          <div className="text-xs text-muted-foreground">
                            Screenshot {index + 1}
                            {index === 0 && booking.paymentHistory?.hasAdditionalPayment && " (Original)"}
                            {index === 1 && booking.paymentHistory?.hasAdditionalPayment && " (Updated)"}
                          </div>
                          <AccommodationPaymentImage
                            src={getS3Url(screenshot)}
                            alt={`Payment Screenshot ${index + 1}`}
                            className="w-full rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}