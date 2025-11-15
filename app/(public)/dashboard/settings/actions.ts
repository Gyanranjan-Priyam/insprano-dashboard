"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for user profile updates
const userProfileUpdateSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid mobile number"),
  whatsappNumber: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^\+?[\d\s\-\(\)]+$/.test(val) && val.replace(/\D/g, '').length >= 10;
  }, "Please enter a valid WhatsApp number"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be 12 digits").max(12, "Aadhaar number must be 12 digits").regex(/^\d{12}$/, "Aadhaar number must contain only digits"),
  state: z.string().min(1, "State is required").max(50, "State name is too long"),
  district: z.string().min(1, "District is required").max(50, "District name is too long"),
  collegeName: z.string().min(1, "College name is required").max(200, "College name is too long"),
  collegeAddress: z.string().min(1, "College address is required").max(500, "College address is too long"),
});

export interface UserProfileData {
  name: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
}

export async function getCurrentUserProfileData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        profileImageKey: true,
        aadhaarNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found",
      };
    }

    // If user data is incomplete, try to get it from their latest participation
    if (!user.aadhaarNumber || !user.state || !user.district || !user.collegeName) {
      const latestParticipation = await prisma.participation.findFirst({
        where: { userId: session.user.id },
        orderBy: { registeredAt: 'desc' },
        select: {
          fullName: true,
          email: true,
          mobileNumber: true,
          whatsappNumber: true,
          aadhaarNumber: true,
          state: true,
          district: true,
          collegeName: true,
          collegeAddress: true,
        },
      });

      if (latestParticipation) {
        // Merge user data with participation data, preferring user data where available
        const mergedData = {
          ...user,
          name: user.name || latestParticipation.fullName,
          email: user.email || latestParticipation.email,
          mobileNumber: user.mobileNumber || latestParticipation.mobileNumber,
          whatsappNumber: user.whatsappNumber || latestParticipation.whatsappNumber,
          aadhaarNumber: user.aadhaarNumber || latestParticipation.aadhaarNumber,
          state: user.state || latestParticipation.state,
          district: user.district || latestParticipation.district,
          collegeName: user.collegeName || latestParticipation.collegeName,
          collegeAddress: user.collegeAddress || latestParticipation.collegeAddress,
        };

        return {
          status: "success" as const,
          data: mergedData,
        };
      }
    }

    return {
      status: "success" as const,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch profile",
    };
  }
}

export async function updateUserProfileData(data: UserProfileData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    // Validate input data
    const validation = userProfileUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error" as const,
        message: "Invalid data provided",
        errors: validation.error.format(),
      };
    }

    const validatedData = validation.data;

    // Check if email is being changed and if it's already taken by another user
    if (validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return {
          status: "error" as const,
          message: "Email address is already taken by another user",
        };
      }
    }

    // Update user profile in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user profile
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: validatedData.name,
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          whatsappNumber: validatedData.whatsappNumber || null,
          aadhaarNumber: validatedData.aadhaarNumber,
          state: validatedData.state,
          district: validatedData.district,
          collegeName: validatedData.collegeName,
          collegeAddress: validatedData.collegeAddress,
          updatedAt: new Date(),
        },
      });

      // Update all user's participations with the new data
      await tx.participation.updateMany({
        where: { userId: session.user.id },
        data: {
          fullName: validatedData.name,
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          whatsappNumber: validatedData.whatsappNumber || null,
          aadhaarNumber: validatedData.aadhaarNumber,
          state: validatedData.state,
          district: validatedData.district,
          collegeName: validatedData.collegeName,
          collegeAddress: validatedData.collegeAddress,
          updatedAt: new Date(),
        },
      });

      // Update all team member records
      await tx.teamMember.updateMany({
        where: { 
          participant: {
            userId: session.user.id
          }
        },
        data: {
          fullName: validatedData.name,
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          whatsappNumber: validatedData.whatsappNumber || null,
          aadhaarNumber: validatedData.aadhaarNumber,
          state: validatedData.state,
          district: validatedData.district,
          collegeName: validatedData.collegeName,
          collegeAddress: validatedData.collegeAddress,
        },
      });

      // Update all team join requests
      await tx.teamJoinRequest.updateMany({
        where: { 
          participant: {
            userId: session.user.id
          }
        },
        data: {
          fullName: validatedData.name,
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber,
          whatsappNumber: validatedData.whatsappNumber || null,
          aadhaarNumber: validatedData.aadhaarNumber,
          state: validatedData.state,
          district: validatedData.district,
          collegeName: validatedData.collegeName,
          collegeAddress: validatedData.collegeAddress,
        },
      });
    });

    // Revalidate the settings page to show updated data
    revalidatePath("/dashboard/settings");

    return {
      status: "success" as const,
      message: "Profile updated successfully. All your event registrations and team information have been updated.",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      status: "error" as const,
      message: "Failed to update profile. Please try again.",
    };
  }
}

export async function updateUserProfileImage(profileImageKey: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    // Update user's profile image
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImageKey: profileImageKey,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        profileImageKey: true,
        updatedAt: true,
      },
    });

    // Revalidate the settings page
    revalidatePath("/dashboard/settings");

    return {
      status: "success" as const,
      message: "Profile image updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return {
      status: "error" as const,
      message: "Failed to update profile image. Please try again.",
    };
  }
}

export async function removeUserProfileImage() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    // Remove user's profile image
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImageKey: null,
        updatedAt: new Date(),
      },
    });

    // Revalidate the settings page
    revalidatePath("/dashboard/settings");

    return {
      status: "success" as const,
      message: "Profile image removed successfully",
    };
  } catch (error) {
    console.error("Error removing profile image:", error);
    return {
      status: "error" as const,
      message: "Failed to remove profile image. Please try again.",
    };
  }
}