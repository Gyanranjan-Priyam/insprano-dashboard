"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarDays,
  User, 
  Hotel,
  UtensilsCrossed,
  IndianRupee,
  Save,
  AlertTriangle,
  FileImage} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateAccommodationBooking, getFoodsForDays, getDatesBetween, getWeekDayFromDate, calculateNights } from "../[userId]/actions";
import { Stay, Food } from "../[userId]/actions";

interface EditBookingFormProps {
  existingBooking: {
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
  };
  userProfile: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  availableStays: Stay[];
  userId: string;
}

interface EditFormData {
  userDetails: {
    name: string;
    mobileNumber: string;
    whatsappNumber: string;
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
  payment: {
    transactionId: string;
    upiId: string;
    paymentScreenshot?: string;
  };
}

export function EditBookingForm({ existingBooking, userProfile, availableStays, userId }: EditBookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<EditFormData>({
    userDetails: {
      name: existingBooking.name,
      mobileNumber: existingBooking.mobileNumber,
      whatsappNumber: existingBooking.whatsappNumber || "",
      state: existingBooking.state,
      district: existingBooking.district,
      collegeName: existingBooking.collegeName,
      collegeAddress: existingBooking.collegeAddress,
    },
    stay: {
      stayId: existingBooking.stayId,
      checkInDate: format(new Date(existingBooking.checkInDate), "yyyy-MM-dd"),
      checkOutDate: format(new Date(existingBooking.checkOutDate), "yyyy-MM-dd"),
      numberOfNights: existingBooking.numberOfNights,
      totalStayPrice: existingBooking.totalStayPrice,
    },
    meals: {
      selectedMeals: existingBooking.selectedMeals,
      totalMealPrice: existingBooking.totalMealPrice,
    },
    payment: {
      transactionId: "",
      upiId: "",
    }
  });

  // Calculate new total and additional amount whenever form data changes
  useEffect(() => {
    const newTotal = formData.stay.totalStayPrice + formData.meals.totalMealPrice;
    const additional = newTotal - existingBooking.totalPrice;
    setAdditionalAmount(Math.max(0, additional));
    setShowPaymentForm(additional > 0);
  }, [formData.stay.totalStayPrice, formData.meals.totalMealPrice, existingBooking.totalPrice]);

  // Fetch foods when dates change
  useEffect(() => {
    if (formData.stay.checkInDate && formData.stay.checkOutDate) {
      fetchAvailableFoods();
    }
  }, [formData.stay.checkInDate, formData.stay.checkOutDate]);

  const fetchAvailableFoods = async () => {
    try {
      const checkIn = new Date(formData.stay.checkInDate);
      const checkOut = new Date(formData.stay.checkOutDate);
      
      // Get all dates between check-in and check-out
      const dates = await getDatesBetween(checkIn, checkOut);
      const weekDays = await Promise.all(
        dates.map((date: Date) => getWeekDayFromDate(date))
      );
      
      // Remove duplicates
      const uniqueWeekDays = [...new Set(weekDays)];
      
      const foodsResult = await getFoodsForDays(uniqueWeekDays as any);
      if (foodsResult.status === "success") {
        setAvailableFoods(foodsResult.data);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
    }
  };

  const handleStayChange = async (stayId: string) => {
    const selectedStay = availableStays.find(s => s.id === stayId);
    if (!selectedStay) return;

    const checkIn = new Date(formData.stay.checkInDate);
    const checkOut = new Date(formData.stay.checkOutDate);
    const nights = await calculateNights(checkIn, checkOut);
    
    setFormData(prev => ({
      ...prev,
      stay: {
        ...prev.stay,
        stayId,
        numberOfNights: nights,
        totalStayPrice: selectedStay.roomPrice * nights
      }
    }));
  };

  const handleDateChange = async (field: 'checkInDate' | 'checkOutDate', value: string) => {
    const newStayData = { ...formData.stay, [field]: value };
    
    if (newStayData.checkInDate && newStayData.checkOutDate) {
      const checkIn = new Date(newStayData.checkInDate);
      const checkOut = new Date(newStayData.checkOutDate);
      
      if (checkOut <= checkIn) {
        toast.error("Check-out date must be after check-in date");
        return;
      }
      
      const nights = await calculateNights(checkIn, checkOut);
      const selectedStay = availableStays.find(s => s.id === formData.stay.stayId);
      
      if (selectedStay) {
        newStayData.numberOfNights = nights;
        newStayData.totalStayPrice = selectedStay.roomPrice * nights;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      stay: newStayData
    }));
  };

  const handleMealToggle = (foodId: string, price: number) => {
    const selectedMeals = formData.meals.selectedMeals;
    const isSelected = selectedMeals.includes(foodId);
    
    let newSelectedMeals: string[];
    let newTotalPrice: number;
    
    if (isSelected) {
      newSelectedMeals = selectedMeals.filter(id => id !== foodId);
      newTotalPrice = formData.meals.totalMealPrice - price;
    } else {
      newSelectedMeals = [...selectedMeals, foodId];
      newTotalPrice = formData.meals.totalMealPrice + price;
    }
    
    setFormData(prev => ({
      ...prev,
      meals: {
        selectedMeals: newSelectedMeals,
        totalMealPrice: Math.max(0, newTotalPrice)
      }
    }));
  };

  const handlePaymentScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    
    try {
      // Basic form validation
      if (!formData.userDetails.name || !formData.userDetails.mobileNumber) {
        toast.error("Please fill in all required personal details");
        setIsLoading(false);
        return;
      }

      if (!formData.stay.checkInDate || !formData.stay.checkOutDate) {
        toast.error("Please select valid check-in and check-out dates");
        setIsLoading(false);
        return;
      }

      // If additional payment is required, validate payment fields
      if (showPaymentForm && additionalAmount > 0) {
        if (!formData.payment.transactionId || !formData.payment.upiId || !paymentScreenshot) {
          toast.error("Please provide all payment details including screenshot");
          setIsLoading(false);
          return;
        }
      }

      let paymentScreenshotUrl = "";
      
      // Upload payment screenshot if provided
      if (paymentScreenshot && additionalAmount > 0) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append("file", paymentScreenshot);
          formDataUpload.append("type", "payment");
          
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formDataUpload,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error("Upload failed:", errorData);
            throw new Error(errorData.error || "Failed to upload payment screenshot");
          }
          
          const uploadResult = await uploadResponse.json();
          if (!uploadResult.success || !uploadResult.key) {
            throw new Error("Upload successful but no file key returned");
          }
          paymentScreenshotUrl = uploadResult.key;
        } catch (uploadError) {
          console.error("Payment screenshot upload error:", uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown upload error";
          throw new Error(`Failed to upload payment screenshot: ${errorMessage}`);
        }
      }

      // Prepare update data
      const updateData: any = {
        userDetails: formData.userDetails,
        stay: formData.stay,
        meals: formData.meals,
        totalPrice: formData.stay.totalStayPrice + formData.meals.totalMealPrice
      };

      // Add payment info if additional amount is required
      if (additionalAmount > 0 && showPaymentForm) {
        updateData.payment = {
          transactionId: formData.payment.transactionId,
          upiId: formData.payment.upiId,
          paymentScreenshot: paymentScreenshotUrl
        };
      }

      const result = await updateAccommodationBooking(existingBooking.id, updateData);
      
      if (result.status === "success") {
        toast.success("Booking updated successfully!");
        router.push(`/dashboard/accommodations/${userId}`);
      } else {
        toast.error(result.message || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("An error occurred while updating the booking");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStay = availableStays.find(s => s.id === formData.stay.stayId);
  const newTotal = formData.stay.totalStayPrice + formData.meals.totalMealPrice;

  // Helper function to get S3 URL
  const getS3Url = (key: string) => {
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
    return `https://${bucketName}.t3.storage.dev/${key}`;
  };

  // Helper function to get payment screenshot URL
  const getPaymentScreenshotUrl = (screenshot: string) => {
    // Check if it's an S3 key or local file
    if (screenshot.includes('/')) {
      // It's a path, might be S3 key
      return getS3Url(screenshot);
    } else {
      // It's a local filename
      return `/uploads/payments/${screenshot}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cost Comparison Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>Original booking total: <span className="font-bold">₹{existingBooking.totalPrice}</span></p>
            <p>New booking total: <span className="font-bold">₹{newTotal}</span></p>
            {additionalAmount > 0 ? (
              <p className="text-orange-600">Additional amount required: <span className="font-bold">₹{additionalAmount}</span></p>
            ) : additionalAmount < 0 ? (
              <p className="text-green-600">You will save: <span className="font-bold">₹{Math.abs(additionalAmount)}</span></p>
            ) : (
              <p className="text-blue-600">No additional payment required</p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Edit Form */}
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
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.userDetails.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userDetails: { ...prev.userDetails, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.userDetails.mobileNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userDetails: { ...prev.userDetails, mobileNumber: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={formData.userDetails.whatsappNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userDetails: { ...prev.userDetails, whatsappNumber: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.userDetails.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userDetails: { ...prev.userDetails, state: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.userDetails.district}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userDetails: { ...prev.userDetails, district: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="college">College Name</Label>
                <Input
                  id="college"
                  value={formData.userDetails.collegeName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    userDetails: { ...prev.userDetails, collegeName: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="collegeAddress">College Address</Label>
                <Textarea
                  id="collegeAddress"
                  value={formData.userDetails.collegeAddress}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    userDetails: { ...prev.userDetails, collegeAddress: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stay Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Accommodation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stay">Select Accommodation</Label>
                <select
                  id="stay"
                  value={formData.stay.stayId}
                  onChange={(e) => handleStayChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableStays.map((stay) => (
                    <option key={stay.id} value={stay.id}>
                      {stay.place} - ₹{stay.roomPrice}/night
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.stay.checkInDate}
                    onChange={(e) => handleDateChange('checkInDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.stay.checkOutDate}
                    onChange={(e) => handleDateChange('checkOutDate', e.target.value)}
                  />
                </div>
              </div>
              
              {currentStay && (
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p><strong>Selected:</strong> {currentStay.place}</p>
                  <p><strong>Duration:</strong> {formData.stay.numberOfNights} night(s)</p>
                  <p><strong>Rate:</strong> ₹{currentStay.roomPrice} per night</p>
                  <p><strong>Total Stay Cost:</strong> ₹{formData.stay.totalStayPrice}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Selection */}
          {availableFoods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  Meal Selection
                </CardTitle>
                <CardDescription>
                  Select meals for your stay. Total meal cost: ₹{formData.meals.totalMealPrice}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableFoods.map((food) => {
                    const isSelected = formData.meals.selectedMeals.includes(food.id);
                    return (
                      <div
                        key={food.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleMealToggle(food.id, food.pricePerDay)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{food.mealType}</h3>
                            <p className="text-sm text-muted-foreground">{food.weekDay}</p>
                            <p className="text-sm">{food.foodItems.join(", ")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{food.pricePerDay}</p>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <span className="text-white text-sm">✓</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details - Only show if additional payment required */}
          {showPaymentForm && additionalAmount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Additional Payment Required
                </CardTitle>
                <CardDescription>
                  You need to pay ₹{additionalAmount} additional for the booking changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      placeholder="Enter transaction ID"
                      value={formData.payment.transactionId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment: { ...prev.payment, transactionId: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="Enter UPI ID"
                      value={formData.payment.upiId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment: { ...prev.payment, upiId: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paymentScreenshot">Payment Screenshot</Label>
                  <Input
                    id="paymentScreenshot"
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentScreenshotChange}
                  />
                  {paymentScreenshot && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <FileImage className="w-4 h-4" />
                      {paymentScreenshot.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Original Booking */}
              <div>
                <h3 className="font-medium mb-2">Original Booking</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Stay: ₹{existingBooking.totalStayPrice}</p>
                  <p>Meals: ₹{existingBooking.totalMealPrice}</p>
                  <p className="font-medium text-foreground">Total: ₹{existingBooking.totalPrice}</p>
                </div>
                {existingBooking.paymentScreenshot && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Original Payment Screenshot:</p>
                    <img 
                      src={getPaymentScreenshotUrl(existingBooking.paymentScreenshot)} 
                      alt="Original Payment" 
                      className="w-full max-w-[200px] rounded border object-cover"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* New Booking */}
              <div>
                <h3 className="font-medium mb-2">Updated Booking</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Stay Cost:</span>
                    <span>₹{formData.stay.totalStayPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meals Cost:</span>
                    <span>₹{formData.meals.totalMealPrice}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>New Total:</span>
                    <span>₹{newTotal}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Amount */}
              <div className="text-lg">
                {additionalAmount > 0 ? (
                  <div className="text-orange-600">
                    <span className="font-medium">Additional Payment: ₹{additionalAmount}</span>
                  </div>
                ) : additionalAmount < 0 ? (
                  <div className="text-green-600">
                    <span className="font-medium">You Save: ₹{Math.abs(additionalAmount)}</span>
                  </div>
                ) : (
                  <div className="text-blue-600">
                    <span className="font-medium">No Additional Payment</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Booking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}