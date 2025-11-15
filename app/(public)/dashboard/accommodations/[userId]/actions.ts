"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WeekDay } from "@/lib/generated/prisma/client";

export interface Stay {
  id: string;
  imageKey: string;
  roomPrice: number;
  place: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Food {
  id: string;
  weekDay: string;
  mealType: string;
  foodItems: string[];
  imageKey: string;
  pricePerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  whatsappNumber: string | null;
  state: string | null;
  district: string | null;
  collegeName: string | null;
  collegeAddress: string | null;
}

export interface BookingData {
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
    selectedMeals: string[]; // Array of food IDs
    totalMealPrice: number;
  };
  totalPrice: number;
}

// Fetch all available stays
export async function getAvailableStays() {
  try {
    const stays = await prisma.stay.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Serialize any potential Decimal fields
    const serializedStays = stays.map(stay => ({
      ...stay,
      roomPrice: typeof stay.roomPrice === 'object' && 'toNumber' in stay.roomPrice
        ? (stay.roomPrice as any).toNumber() 
        : Number(stay.roomPrice)
    }));
    
    return {
      status: "success" as const,
      data: serializedStays
    };
  } catch (error) {
    console.error("Error fetching stays:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch stays"
    };
  }
}

// Fetch foods for specific days
export async function getFoodsForDays(weekDays: WeekDay[]) {
  try {
    const foods = await prisma.food.findMany({
      where: {
        weekDay: {
          in: weekDays
        }
      },
      orderBy: [
        { weekDay: 'asc' },
        { mealType: 'asc' }
      ]
    });
    
    // Serialize any potential Decimal fields
    const serializedFoods = foods.map(food => ({
      ...food,
      pricePerDay: typeof food.pricePerDay === 'object' && 'toNumber' in food.pricePerDay
        ? (food.pricePerDay as any).toNumber() 
        : Number(food.pricePerDay)
    }));
    
    return {
      status: "success" as const,
      data: serializedFoods
    };
  } catch (error) {
    console.error("Error fetching foods:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch food options"
    };
  }
}

// Get user profile data
export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) {
      return {
        status: "error" as const,
        message: "Not authenticated"
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true
      }
    });

    return {
      status: "success" as const,
      data: user
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch user profile"
    };
  }
}

// Update user profile
export async function updateUserProfile(data: {
  name: string;
  mobileNumber: string;
  whatsappNumber?: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) {
      return {
        status: "error" as const,
        message: "Not authenticated"
      };
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        mobileNumber: data.mobileNumber,
        whatsappNumber: data.whatsappNumber || null,
        state: data.state,
        district: data.district,
        collegeName: data.collegeName,
        collegeAddress: data.collegeAddress
      }
    });

    return {
      status: "success" as const,
      message: "Profile updated successfully"
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to update profile"
    };
  }
}

// Create accommodation booking
export async function createAccommodationBooking(bookingData: BookingData & { 
  payment?: { 
    transactionId: string; 
    paymentScreenshot: string; 
    upiId: string; 
  } 
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) {
      return {
        status: "error" as const,
        message: "Not authenticated"
      };
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found"
      };
    }

    // Check if user already has a confirmed booking
    const existingBooking = await prisma.accommodationBooking.findFirst({
      where: { 
        userId: user.id,
        status: "CONFIRMED"
      }
    });

    if (existingBooking) {
      return {
        status: "error" as const,
        message: "You already have an active accommodation booking. You can edit your existing booking instead."
      };
    }

    // Create accommodation booking
    const booking = await prisma.accommodationBooking.create({
      data: {
        userId: user.id,
        // User Details
        name: bookingData.userDetails.name,
        mobileNumber: bookingData.userDetails.mobileNumber,
        whatsappNumber: bookingData.userDetails.whatsappNumber || null,
        state: bookingData.userDetails.state,
        district: bookingData.userDetails.district,
        collegeName: bookingData.userDetails.collegeName,
        collegeAddress: bookingData.userDetails.collegeAddress,
        // Stay Details
        stayId: bookingData.stay.stayId,
        roomType: "Standard", // Default room type - will be updated later
        checkInDate: new Date(bookingData.stay.checkInDate),
        checkOutDate: new Date(bookingData.stay.checkOutDate),
        numberOfNights: bookingData.stay.numberOfNights,
        totalStayPrice: bookingData.stay.totalStayPrice,
        // Meal Details
        selectedMeals: bookingData.meals.selectedMeals,
        totalMealPrice: bookingData.meals.totalMealPrice,
        // Payment Details
        totalPrice: bookingData.totalPrice || (bookingData.stay.totalStayPrice + bookingData.meals.totalMealPrice),
        transactionId: bookingData.payment?.transactionId || null,
        paymentScreenshot: bookingData.payment?.paymentScreenshot || null,
        upiId: bookingData.payment?.upiId || null,
        paymentStatus: bookingData.payment ? "PENDING" : "PENDING"
      }
    });

    return {
      status: "success" as const,
      data: { id: booking.id, ...bookingData },
      message: "Booking created successfully"
    };
  } catch (error) {
    console.error("Error creating accommodation booking:", error);
    return {
      status: "error" as const,
      message: "Failed to create booking"
    };
  }
}

// Get week day from date
export async function getWeekDayFromDate(date: Date): Promise<WeekDay> {
  const days: WeekDay[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
}

// Get dates between two dates
export async function getDatesBetween(startDate: Date, endDate: Date): Promise<Date[]> {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Get user's existing accommodation booking with payment history
export async function getUserAccommodationBooking() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) {
      return {
        status: "error" as const,
        message: "Not authenticated"
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found"
      };
    }

    const booking = await prisma.accommodationBooking.findFirst({
      where: { 
        userId: user.id,
        status: "CONFIRMED" // Only get confirmed bookings
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!booking) {
      return {
        status: "success" as const,
        data: null
      };
    }

    // Build payment history from database fields
    const paymentHistory = booking.hasBeenModified ? {
      originalPayment: {
        totalStayPrice: (booking.originalTotalPrice || booking.totalPrice).toNumber(),
        totalMealPrice: 0, // We don't track original meal price separately yet
        totalAmount: (booking.originalTotalPrice || booking.totalPrice).toNumber(),
        transactionId: booking.originalTransactionId || null,
        paymentScreenshot: booking.originalPaymentScreenshot || null,
        paymentStatus: booking.originalPaymentStatus || "PENDING",
        createdAt: booking.createdAt
      },
      hasAdditionalPayment: booking.hasBeenModified,
      lastModified: booking.updatedAt
    } : null;

    // Serialize Decimal fields
    const serializedBooking = {
      ...booking,
      totalStayPrice: booking.totalStayPrice.toNumber(),
      totalMealPrice: booking.totalMealPrice.toNumber(),
      totalPrice: booking.totalPrice.toNumber(),
      originalTotalPrice: booking.originalTotalPrice?.toNumber() || null,
      paymentHistory
    };

    return {
      status: "success" as const,
      data: serializedBooking
    };
  } catch (error) {
    console.error("Error fetching user booking:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch booking"
    };
  }
}

// Update existing accommodation booking
export async function updateAccommodationBooking(bookingId: string, bookingData: Partial<BookingData & { 
  payment?: { 
    transactionId: string; 
    paymentScreenshot: string; 
    upiId: string; 
  } 
}>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.email) {
      return {
        status: "error" as const,
        message: "Not authenticated"
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found"
      };
    }

    // Verify the booking belongs to the user
    const existingBooking = await prisma.accommodationBooking.findFirst({
      where: { 
        id: bookingId,
        userId: user.id 
      }
    });

    if (!existingBooking) {
      return {
        status: "error" as const,
        message: "Booking not found or unauthorized"
      };
    }

    // If this is the first edit, store original payment information
    let updateData: any = {};
    
    if (!existingBooking.hasBeenModified) {
      updateData.originalTotalPrice = existingBooking.totalPrice;
      updateData.originalTransactionId = existingBooking.transactionId;
      updateData.originalPaymentScreenshot = existingBooking.paymentScreenshot;
      updateData.originalPaymentStatus = existingBooking.paymentStatus;
      updateData.hasBeenModified = true;
    }
    
    if (bookingData.userDetails) {
      updateData.name = bookingData.userDetails.name;
      updateData.mobileNumber = bookingData.userDetails.mobileNumber;
      updateData.whatsappNumber = bookingData.userDetails.whatsappNumber || null;
      updateData.state = bookingData.userDetails.state;
      updateData.district = bookingData.userDetails.district;
      updateData.collegeName = bookingData.userDetails.collegeName;
      updateData.collegeAddress = bookingData.userDetails.collegeAddress;
    }

    if (bookingData.stay) {
      updateData.stayId = bookingData.stay.stayId;
      updateData.checkInDate = new Date(bookingData.stay.checkInDate);
      updateData.checkOutDate = new Date(bookingData.stay.checkOutDate);
      updateData.numberOfNights = bookingData.stay.numberOfNights;
      updateData.totalStayPrice = bookingData.stay.totalStayPrice;
    }

    if (bookingData.meals) {
      updateData.selectedMeals = bookingData.meals.selectedMeals;
      updateData.totalMealPrice = bookingData.meals.totalMealPrice;
    }

    if (bookingData.totalPrice) {
      updateData.totalPrice = bookingData.totalPrice;
    }

    if (bookingData.payment) {
      updateData.transactionId = bookingData.payment.transactionId;
      updateData.paymentScreenshot = bookingData.payment.paymentScreenshot;
      updateData.upiId = bookingData.payment.upiId;
      updateData.paymentStatus = "PENDING";
    }

    const updatedBooking = await prisma.accommodationBooking.update({
      where: { id: bookingId },
      data: updateData
    });

    // Serialize Decimal fields
    const serializedUpdatedBooking = {
      ...updatedBooking,
      totalStayPrice: updatedBooking.totalStayPrice.toNumber(),
      totalMealPrice: updatedBooking.totalMealPrice.toNumber(),
      totalPrice: updatedBooking.totalPrice.toNumber(),
      originalTotalPrice: updatedBooking.originalTotalPrice?.toNumber() || null,
    };

    return {
      status: "success" as const,
      data: serializedUpdatedBooking,
      message: "Booking updated successfully"
    };
  } catch (error) {
    console.error("Error updating accommodation booking:", error);
    return {
      status: "error" as const,
      message: "Failed to update booking"
    };
  }
}

// Calculate number of nights between dates
export async function calculateNights(checkIn: Date, checkOut: Date): Promise<number> {
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}