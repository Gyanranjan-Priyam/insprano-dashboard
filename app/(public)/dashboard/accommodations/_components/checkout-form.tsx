"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createAccommodationBooking, getAvailableStays, getFoodsForDays } from "../[userId]/actions";
import { 
  ArrowLeft, 
  Check, 
  User, 
  Hotel, 
  UtensilsCrossed, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Building,
  IndianRupee,
  CreditCard,
  QrCode,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface BookingData {
  userDetails: {
    name: string;
    email: string;
    mobileNumber: string;
    whatsappNumber?: string;
    state: string;
    district: string;
    collegeName: string;
    collegeAddress: string;
  };
  stay: {
    stayId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    totalStayPrice: number;
  };
  meals: {
    selectedMeals: string[];
    totalMealPrice: number;
  };
  step: string;
}

interface CheckoutFormProps {
  upiId: string;
  userId: string;
}

export function CheckoutForm({ upiId, userId }: CheckoutFormProps) {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [stayDetails, setStayDetails] = useState<any>(null);
  const [mealDetails, setMealDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      // Load booking data from localStorage
      const stored = localStorage.getItem("accommodationBooking");
      if (!stored) {
        router.push(`/dashboard/accommodations/${userId}`);
        return;
      }

      try {
        const data: BookingData = JSON.parse(stored);
        if (!data.stay || !data.meals) {
          router.push(`/dashboard/accommodations/${userId}`);
          return;
        }

        setBookingData(data);

        // Fetch stay details
        const staysResult = await getAvailableStays();
        if (staysResult.status === "success") {
          const stay = staysResult.data.find(s => s.id === data.stay.stayId);
          setStayDetails(stay);
        }

        // Fetch meal details if any meals selected
        if (data.meals.selectedMeals.length > 0) {
          // Get unique week days from dates
          const checkInDate = new Date(data.stay.checkInDate);
          const checkOutDate = new Date(data.stay.checkOutDate);
          const dates: Date[] = [];
          const currentDate = new Date(checkInDate);
          
          while (currentDate < checkOutDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          const getWeekDayFromDate = (date: Date) => {
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            return days[date.getDay()];
          };

          const weekDays = dates.map(date => getWeekDayFromDate(date));
          const uniqueWeekDays = Array.from(new Set(weekDays));

          const mealsResult = await getFoodsForDays(uniqueWeekDays as any);
          if (mealsResult.status === "success") {
            const selectedMealDetails = mealsResult.data.filter(meal => 
              data.meals.selectedMeals.includes(meal.id)
            );
            setMealDetails(selectedMealDetails);
          }
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Something went wrong. Please try again.");
        router.push(`/dashboard/accommodations/${userId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Generate QR code URL when component loads
  useEffect(() => {
    if (upiId && bookingData) {
      const amount = getTotalPrice();
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Accommodation%20Booking`;
      setQrCodeUrl(qrUrl);
    }
  }, [upiId, bookingData]);

  const formatWeekDay = (weekDay: string) => {
    return weekDay.charAt(0) + weekDay.slice(1).toLowerCase();
  };

  const formatMealType = (mealType: string) => {
    return mealType.charAt(0) + mealType.slice(1).toLowerCase();
  };

  const getTotalPrice = () => {
    if (!bookingData) return 0;
    return bookingData.stay.totalStayPrice + bookingData.meals.totalMealPrice;
  };

  const handleGoBack = () => {
    router.push(`/dashboard/accommodations/${userId}/meal-selection`);
  };

  const handleConfirmBooking = async () => {
    if (!bookingData || !transactionId || !paymentUrl) {
      toast.error("Please complete payment verification");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalBookingData = {
        ...bookingData,
        totalPrice: getTotalPrice(),
        payment: {
          transactionId,
          paymentScreenshot: paymentUrl, // This is now the S3 key
          upiId: upiId
        }
      };

      const result = await createAccommodationBooking(finalBookingData);
      
      if (result && (result as any).status === "success") {
        toast.success("Booking confirmed successfully!");
        localStorage.removeItem("accommodationBooking");
        router.push(`/dashboard/accommodations/${userId}/success`);
      } else {
        toast.error((result as any)?.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG) or PDF");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // First get pre-signed URL from S3
      const preSignedResponse = await fetch('/api/s3/payment-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const preSignedResult = await preSignedResponse.json();

      if (!preSignedResponse.ok || preSignedResult.error) {
        throw new Error(preSignedResult.error || 'Failed to get upload URL');
      }

      // Upload file to S3 using pre-signed URL
      const uploadResponse = await fetch(preSignedResult.preSignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setPaymentUrl(preSignedResult.key);
      setPaymentFile(file);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload screenshot. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookingData) {
    return <div>No booking data found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={handleGoBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Meal Selection
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{bookingData.userDetails.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{bookingData.userDetails.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{bookingData.userDetails.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{bookingData.userDetails.district}, {bookingData.userDetails.state}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium">{bookingData.userDetails.collegeName}</div>
                  <div className="text-sm text-muted-foreground">{bookingData.userDetails.collegeAddress}</div>
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
              {stayDetails && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={`https://registration.t3.storage.dev/${stayDetails.imageKey}`}
                        alt={stayDetails.place}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {stayDetails.place}
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        ₹{stayDetails.roomPrice} per night
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Check-in:</span>
                      <span className="font-medium">
                        {format(new Date(bookingData.stay.checkInDate), "PPP")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out:</span>
                      <span className="font-medium">
                        {format(new Date(bookingData.stay.checkOutDate), "PPP")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {bookingData.stay.numberOfNights} night{bookingData.stay.numberOfNights !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Details */}
          {mealDetails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  Selected Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealDetails.map((meal) => (
                    <div key={meal.id} className="flex items-start gap-4 p-3 bg-muted/20 rounded-lg">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={`https://registration.t3.storage.dev/${meal.imageKey}`}
                          alt={`${meal.weekDay} ${meal.mealType}`}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {formatWeekDay(meal.weekDay)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatMealType(meal.mealType)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {meal.foodItems.join(", ")}
                        </div>
                        <div className="text-lg font-semibold text-green-600 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {meal.pricePerDay}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Complete your payment to confirm the booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Instructions */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please complete the payment using the UPI QR code below and upload the payment screenshot for verification.
                </AlertDescription>
              </Alert>

              {/* UPI QR Code */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-muted/20 rounded-lg">
                <div className="text-center space-y-2">
                  <p className="font-semibold">Scan QR Code to Pay</p>
                  <p className="text-sm text-muted-foreground">Amount: ₹{getTotalPrice()}</p>
                  <p className="text-sm text-muted-foreground">UPI ID: {upiId}</p>
                </div>
                
                {qrCodeUrl && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Image
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter your transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              {/* Payment Screenshot Upload */}
              <div className="space-y-2">
                <Label htmlFor="paymentFile">Payment Screenshot *</Label>
                <div className="space-y-2">
                  <Input
                    id="paymentFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                  {paymentFile && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {paymentFile.name} uploaded successfully
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot of your payment confirmation (Image or PDF, max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stay Cost */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Stay Cost:</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {bookingData.stay.totalStayPrice}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {bookingData.stay.numberOfNights} night{bookingData.stay.numberOfNights !== 1 ? 's' : ''} × ₹{stayDetails?.roomPrice || 0}
                </div>
              </div>

              {/* Meal Cost */}
              {bookingData.meals.totalMealPrice > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Meals Cost:</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {bookingData.meals.totalMealPrice}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bookingData.meals.selectedMeals.length} meal{bookingData.meals.selectedMeals.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-green-600 flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {getTotalPrice()}
                </span>
              </div>

              {/* Confirm Button */}
              <Button 
                onClick={handleConfirmBooking}
                disabled={isSubmitting || isUploading || !transactionId || !paymentUrl}
                className="w-full mt-6"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming Booking...
                  </div>
                ) : isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Screenshot...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Confirm Booking
                  </div>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center mt-2">
                {(!transactionId || !paymentUrl) ? (
                  "Please upload payment screenshot and enter transaction ID to continue"
                ) : (
                  "By confirming, you agree to our terms and conditions"
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}