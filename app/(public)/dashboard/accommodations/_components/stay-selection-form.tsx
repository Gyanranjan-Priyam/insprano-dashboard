"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Stay } from "../[userId]/actions";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, MapPin, Hotel, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface StaySelectionFormProps {
  stays: Stay[];
  userId: string;
}

interface BookingData {
  userDetails: any;
  step: string;
  stay?: {
    stayId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    totalStayPrice: number;
  };
}

export function StaySelectionForm({ stays, userId }: StaySelectionFormProps) {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to calculate nights between dates
  const calculateNights = (checkIn: Date, checkOut: Date): number => {
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  useEffect(() => {
    // Load booking data from localStorage
    const stored = localStorage.getItem("accommodationBooking");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setBookingData(data);
      } catch (error) {
        console.error("Error parsing booking data:", error);
        router.push(`/dashboard/accommodations/${userId}`);
      }
    } else {
      router.push(`/dashboard/accommodations/${userId}`);
    }
  }, [router, userId]);

  // Pre-populate form when editing existing booking
  useEffect(() => {
    if (bookingData?.stay && stays.length > 0) {
      const existingStay = stays.find(stay => stay.id === bookingData.stay?.stayId);
      if (existingStay) {
        setSelectedStay(existingStay);
        setCheckInDate(new Date(bookingData.stay.checkInDate));
        setCheckOutDate(new Date(bookingData.stay.checkOutDate));
      }
    }
  }, [bookingData, stays]);

  const handleStaySelect = (stay: Stay) => {
    setSelectedStay(stay);
  };

  const handleCheckInDateSelect = (date: Date | undefined) => {
    setCheckInDate(date);
    // Clear checkout date if it's before the new checkin date
    if (date && checkOutDate && checkOutDate <= date) {
      setCheckOutDate(undefined);
    }
  };

  const handleCheckOutDateSelect = (date: Date | undefined) => {
    setCheckOutDate(date);
  };

  const calculateTotalPrice = () => {
    if (!selectedStay || !checkInDate || !checkOutDate) return 0;
    const nights = calculateNights(checkInDate, checkOutDate);
    return selectedStay.roomPrice * nights;
  };

  const getNumberOfNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return calculateNights(checkInDate, checkOutDate);
  };

  const validateSelection = () => {
    if (!selectedStay) {
      toast.error("Please select a stay");
      return false;
    }
    
    if (!checkInDate) {
      toast.error("Please select check-in date");
      return false;
    }
    
    if (!checkOutDate) {
      toast.error("Please select check-out date");
      return false;
    }
    
    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      toast.error("Check-in date cannot be in the past");
      return false;
    }
    
    return true;
  };

  const handleContinue = () => {
    if (!validateSelection() || !bookingData) return;
    
    setIsLoading(true);
    
    try {
      const updatedBookingData = {
        ...bookingData,
        stay: {
          stayId: selectedStay!.id,
          checkInDate: checkInDate!.toISOString(),
          checkOutDate: checkOutDate!.toISOString(),
          numberOfNights: getNumberOfNights(),
          totalStayPrice: calculateTotalPrice(),
        },
        step: "meal-selection"
      };
      
      localStorage.setItem("accommodationBooking", JSON.stringify(updatedBookingData));
      router.push(`/dashboard/accommodations/${userId}/meal-selection`);
    } catch (error) {
      console.error("Error saving stay selection:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push(`/dashboard/accommodations/${userId}`);
  };

  if (!bookingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={handleGoBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Personal Details
      </Button>

      {/* Stay Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            Choose Your Accommodation
          </CardTitle>
          <CardDescription>
            Select from our available stay options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stays.map((stay) => (
              <div
                key={stay.id}
                className={cn(
                  "relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md",
                  selectedStay?.id === stay.id ? "ring-2 ring-primary shadow-md" : ""
                )}
                onClick={() => handleStaySelect(stay)}
              >
                <div className="relative h-48 bg-muted">
                  <Image
                    src={`https://registration.t3.storage.dev/${stay.imageKey}`}
                    alt={stay.place}
                    fill
                    className="object-cover"
                    priority
                  />
                  {selectedStay?.id === stay.id && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {stay.place}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {stay.roomPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">per night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Select Your Dates
          </CardTitle>
          <CardDescription>
            Choose your check-in and check-out dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Pick check-in date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={handleCheckInDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                    disabled={!checkInDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : "Pick check-out date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={handleCheckOutDateSelect}
                    disabled={(date) => !checkInDate || date <= checkInDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Booking Summary */}
          {selectedStay && checkInDate && checkOutDate && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Accommodation:</span>
                  <span className="font-medium">{selectedStay.place}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-medium">{format(checkInDate, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-medium">{format(checkOutDate, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of nights:</span>
                  <span className="font-medium">{getNumberOfNights()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>Total Stay Cost:</span>
                  <span className="text-green-600 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {calculateTotalPrice()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={isLoading || !selectedStay || !checkInDate || !checkOutDate}
          className="min-w-32"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Continue to Meal Selection
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}