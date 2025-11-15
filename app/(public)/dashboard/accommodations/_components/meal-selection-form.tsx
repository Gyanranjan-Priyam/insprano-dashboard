"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Food, getFoodsForDays } from "../[userId]/actions";
import { ArrowLeft, ArrowRight, UtensilsCrossed, Calendar, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { WeekDay } from "@/lib/generated/prisma/client";
import Image from "next/image";

interface BookingData {
  userDetails: any;
  stay: {
    stayId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    totalStayPrice: number;
  };
  step: string;
  meals?: {
    selectedMeals: string[];
    totalMealPrice: number;
  };
}

interface DayMeals {
  date: Date;
  weekDay: WeekDay;
  meals: Food[];
}

interface MealSelectionFormProps {
  userId: string;
}

export function MealSelectionForm({ userId }: MealSelectionFormProps) {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [dayMeals, setDayMeals] = useState<DayMeals[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get weekday from date
  const getWeekDayFromDate = (date: Date): WeekDay => {
    const days: WeekDay[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

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
        if (!data.stay) {
          router.push(`/dashboard/accommodations/${userId}/stay-selection`);
          return;
        }

        setBookingData(data);

        // Generate dates and fetch meals
        const checkInDate = new Date(data.stay.checkInDate);
        const checkOutDate = new Date(data.stay.checkOutDate);
        const dates: Date[] = [];
        const currentDate = new Date(checkInDate);
        
        while (currentDate < checkOutDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Get unique week days
        const weekDays = dates.map(date => getWeekDayFromDate(date));
        const uniqueWeekDays = Array.from(new Set(weekDays));

        // Fetch meals for these days
        const mealsResult = await getFoodsForDays(uniqueWeekDays);
        
        if (mealsResult.status === "success") {
          const dayMealsData: DayMeals[] = dates.map(date => {
            const weekDay = getWeekDayFromDate(date);
            const meals = mealsResult.data.filter(meal => meal.weekDay === weekDay);
            return { date, weekDay, meals };
          });
          
          setDayMeals(dayMealsData);
          
          // Pre-populate selected meals if editing existing booking
          if (data.meals?.selectedMeals) {
            setSelectedMeals(new Set(data.meals.selectedMeals));
          }
        } else {
          toast.error("Failed to load meal options");
        }
      } catch (error) {
        console.error("Error loading meal data:", error);
        toast.error("Something went wrong. Please try again.");
        router.push(`/dashboard/accommodations/${userId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleMealToggle = (mealId: string) => {
    const newSelectedMeals = new Set(selectedMeals);
    if (selectedMeals.has(mealId)) {
      newSelectedMeals.delete(mealId);
    } else {
      newSelectedMeals.add(mealId);
    }
    setSelectedMeals(newSelectedMeals);
  };

  const calculateTotalMealPrice = () => {
    let total = 0;
    dayMeals.forEach(day => {
      day.meals.forEach(meal => {
        if (selectedMeals.has(meal.id)) {
          total += meal.pricePerDay;
        }
      });
    });
    return total;
  };

  const formatWeekDay = (weekDay: string) => {
    return weekDay.charAt(0) + weekDay.slice(1).toLowerCase();
  };

  const formatMealType = (mealType: string) => {
    return mealType.charAt(0) + mealType.slice(1).toLowerCase();
  };

  const handleGoBack = () => {
    router.push(`/dashboard/accommodations/${userId}/stay-selection`);
  };

  const handleContinue = () => {
    if (!bookingData) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedBookingData = {
        ...bookingData,
        meals: {
          selectedMeals: Array.from(selectedMeals),
          totalMealPrice: calculateTotalMealPrice(),
        },
        step: "checkout"
      };
      
      localStorage.setItem("accommodationBooking", JSON.stringify(updatedBookingData));
      router.push(`/dashboard/accommodations/${userId}/checkout`);
    } catch (error) {
      console.error("Error saving meal selection:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
        Back to Stay Selection
      </Button>

      {/* Stay Summary */}
      {bookingData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Stay Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium">Check-in:</span>{" "}
                {format(new Date(bookingData.stay.checkInDate), "PPP")}
              </div>
              <div>
                <span className="font-medium">Check-out:</span>{" "}
                {format(new Date(bookingData.stay.checkOutDate), "PPP")}
              </div>
              <div>
                <span className="font-medium">Duration:</span>{" "}
                {bookingData.stay.numberOfNights} night{bookingData.stay.numberOfNights !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meal Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            Select Your Meals
          </CardTitle>
          <CardDescription>
            Choose the meals you'd like for each day of your stay
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dayMeals.length === 0 ? (
            <div className="text-center py-8">
              <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meals available</h3>
              <p className="text-muted-foreground">
                There are no meal options available for your selected dates.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {dayMeals.map((day, dayIndex) => (
                <div key={dayIndex} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">
                      {format(day.date, "EEEE, MMMM d")}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {formatWeekDay(day.weekDay)}
                    </Badge>
                  </div>
                  
                  {day.meals.length === 0 ? (
                    <div className="text-muted-foreground italic">
                      No meals available for this day
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {day.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                            selectedMeals.has(meal.id) 
                              ? "ring-2 ring-primary shadow-md" 
                              : "hover:shadow-sm"
                          }`}
                          onClick={() => handleMealToggle(meal.id)}
                        >
                          <div className="relative h-32 bg-muted">
                            <Image
                              src={`https://registration.t3.storage.dev/${meal.imageKey}`}
                              alt={`${meal.weekDay} ${meal.mealType}`}
                              fill
                              className="object-cover"
                              priority
                            />
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary">
                                {formatMealType(meal.mealType)}
                              </Badge>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Checkbox
                                checked={selectedMeals.has(meal.id)}
                                onChange={() => handleMealToggle(meal.id)}
                                className="bg-white"
                              />
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">
                                Food Items:
                              </div>
                              <div className="text-sm font-medium">
                                {meal.foodItems.join(", ")}
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                                  <IndianRupee className="w-4 h-4" />
                                  {meal.pricePerDay}
                                </span>
                                <span className="text-xs text-muted-foreground">per day</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Meals Summary */}
      {selectedMeals.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Meals Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total selected meals:</span>
                <span className="font-medium">{selectedMeals.size}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total Meal Cost:</span>
                <span className="text-green-600 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {calculateTotalMealPrice()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Continue to Checkout
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}