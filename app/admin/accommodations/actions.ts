"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Stay Actions
export async function getAllStays() {
  try {
    await requireAdmin();

    const stays = await prisma.stay.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { status: "success" as const, data: stays };
  } catch (error) {
    console.error("Error fetching stays:", error);
    return { status: "error" as const, message: "Failed to fetch stays" };
  }
}

export async function createStay(data: {
  imageKey: string;
  roomPrice: number;
  place: string;
}) {
  try {
    await requireAdmin();

    const stay = await prisma.stay.create({
      data: {
        imageKey: data.imageKey,
        roomPrice: data.roomPrice,
        place: data.place,
      },
    });

    revalidatePath("/admin/accommodations");
    return { status: "success" as const, data: stay };
  } catch (error) {
    console.error("Error creating stay:", error);
    return { status: "error" as const, message: "Failed to create stay" };
  }
}

export async function updateStay(
  id: string,
  data: {
    imageKey?: string;
    roomPrice?: number;
    place?: string;
  }
) {
  try {
    await requireAdmin();

    const stay = await prisma.stay.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/accommodations");
    return { status: "success" as const, data: stay };
  } catch (error) {
    console.error("Error updating stay:", error);
    return { status: "error" as const, message: "Failed to update stay" };
  }
}

export async function deleteStay(id: string) {
  try {
    await requireAdmin();

    await prisma.stay.delete({
      where: { id },
    });

    revalidatePath("/admin/accommodations");
    return { status: "success" as const, message: "Stay deleted successfully" };
  } catch (error) {
    console.error("Error deleting stay:", error);
    return { status: "error" as const, message: "Failed to delete stay" };
  }
}

// Food Actions
export async function getAllFoods() {
  try {
    await requireAdmin();

    const foods = await prisma.food.findMany({
      orderBy: [{ weekDay: "asc" }, { mealType: "asc" }],
    });

    return { status: "success" as const, data: foods };
  } catch (error) {
    console.error("Error fetching foods:", error);
    return { status: "error" as const, message: "Failed to fetch foods" };
  }
}

export async function createFood(data: {
  weekDay: string;
  mealType: string;
  foodItems: string[];
  imageKey: string;
  pricePerDay: number;
}) {
  try {
    await requireAdmin();

    const food = await prisma.food.create({
      data: {
        weekDay: data.weekDay as any,
        mealType: data.mealType as any,
        foodItems: data.foodItems,
        imageKey: data.imageKey,
        pricePerDay: data.pricePerDay,
      },
    });

    revalidatePath("/admin/accommodations");
    return { status: "success" as const, data: food };
  } catch (error) {
    console.error("Error creating food:", error);
    return { status: "error" as const, message: "Failed to create food" };
  }
}

export async function updateFood(
  id: string,
  data: {
    weekDay?: string;
    mealType?: string;
    foodItems?: string[];
    imageKey?: string;
    pricePerDay?: number;
  }
) {
  try {
    await requireAdmin();

    const food = await prisma.food.update({
      where: { id },
      data: {
        ...data,
        weekDay: data.weekDay as any,
        mealType: data.mealType as any,
      },
    });

    revalidatePath("/admin/accommodations");
    return { status: "success" as const, data: food };
  } catch (error) {
    console.error("Error updating food:", error);
    return { status: "error" as const, message: "Failed to update food" };
  }
}

export async function deleteFood(id: string) {
  try {
    await requireAdmin();

    await prisma.food.delete({
      where: { id },
    });

    revalidatePath("/admin/accommodations");
    return { status: "success" as const, message: "Food deleted successfully" };
  } catch (error) {
    console.error("Error deleting food:", error);
    return { status: "error" as const, message: "Failed to delete food" };
  }
}

export async function getAccommodationStatistics() {
  try {
    await requireAdmin();

    const [totalStays, totalFoodItems, avgStayPrice] = await Promise.all([
      prisma.stay.count(),
      prisma.food.count(),
      prisma.stay.aggregate({
        _avg: {
          roomPrice: true,
        },
      }),
    ]);

    return {
      status: "success" as const,
      data: {
        totalStays,
        totalFoodItems,
        avgStayPrice: Math.round(avgStayPrice._avg.roomPrice || 0),
      },
    };
  } catch (error) {
    console.error("Error fetching accommodation statistics:", error);
    return { status: "error" as const, message: "Failed to fetch statistics" };
  }
}