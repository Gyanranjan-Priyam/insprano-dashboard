"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { participationSchema, ParticipationSchemaType } from "@/lib/zodSchema";
import { revalidatePath } from "next/cache";

export async function getParticipationForEdit(eventSlugId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        status: "error",
        message: "Authentication required",
      };
    }

    // Get event by slug
    const event = await prisma.event.findUnique({
      where: { slugId: eventSlugId },
      select: { id: true, title: true, slugId: true }
    });

    if (!event) {
      return {
        status: "error",
        message: "Event not found",
      };
    }

    // Get user's participation for this event
    const participation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        eventId: event.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        aadhaarNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
        status: true,
        registeredAt: true,
      }
    });

    if (!participation) {
      return {
        status: "error",
        message: "Participation not found",
      };
    }

    return {
      status: "success",
      data: {
        participation,
        event
      }
    };
  } catch (error) {
    console.error("Failed to get participation for edit:", error);
    return {
      status: "error",
      message: "Failed to load participation data",
    };
  }
}

export async function updateParticipationAction(eventSlugId: string, data: ParticipationSchemaType) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        status: "error",
        message: "Authentication required",
      };
    }

    // Validate the input data
    const validatedData = participationSchema.parse(data);

    // Get event by slug
    const event = await prisma.event.findUnique({
      where: { slugId: eventSlugId },
      select: { id: true }
    });

    if (!event) {
      return {
        status: "error",
        message: "Event not found",
      };
    }

    // Check if participation exists
    const existingParticipation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        eventId: event.id,
      }
    });

    if (!existingParticipation) {
      return {
        status: "error",
        message: "Participation not found",
      };
    }

    // Update the participation
    await prisma.participation.update({
      where: {
        id: existingParticipation.id,
      },
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        mobileNumber: validatedData.mobileNumber,
        whatsappNumber: validatedData.whatsappNumber || null,
        aadhaarNumber: validatedData.aadhaarNumber,
        state: validatedData.state,
        district: validatedData.district,
        collegeName: validatedData.collegeName,
        collegeAddress: validatedData.collegeAddress,
      }
    });

    // Automatically sync updated participation data back to user profile
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: validatedData.fullName,
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
      console.log(`User profile updated automatically for user ${session.user.id} from participation edit`);
    } catch (profileUpdateError) {
      console.error('Failed to auto-update user profile from participation edit:', profileUpdateError);
      // Don't fail the participation update if profile update fails
    }

    // Revalidate pages to show updated data
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/participate");

    return {
      status: "success",
      message: "Participation updated successfully. Your profile has been automatically updated as well.",
    };
  } catch (error) {
    console.error("Failed to update participation:", error);
    
    if (error instanceof Error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "Failed to update participation",
    };
  }
}