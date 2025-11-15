"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { checkoutSchema, CheckoutSchemaType, ParticipationSchemaType } from "@/lib/zodSchema";
import { sendConfirmationEmailWithAttachment } from "@/lib/mailer";
import { generateRegistrationPDF } from "@/lib/pdf-generator";

export async function completeRegistrationAction(
  eventId: string,
  registrationData: ParticipationSchemaType,
  checkoutData: CheckoutSchemaType
) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { status: "error", message: "Authentication required" };
    }

    // Validate the checkout data
    const validatedCheckoutData = checkoutSchema.parse(checkoutData);

    // Check if user is already registered for this event
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId,
        },
      },
    });

    if (existingParticipation) {
      return { status: "error", message: "You are already registered for this event" };
    }

    // Get event details for payment amount
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        price: true, 
        title: true, 
        date: true, 
        venue: true 
      },
    });

    if (!event) {
      return { status: "error", message: "Event not found" };
    }

    // Create the participation record with payment details
    const participation = await prisma.participation.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
        status: "PAYMENT_SUBMITTED",
        fullName: registrationData.fullName,
        email: registrationData.email,
        mobileNumber: registrationData.mobileNumber,
        whatsappNumber: registrationData.whatsappNumber || null,
        aadhaarNumber: registrationData.aadhaarNumber,
        state: registrationData.state,
        district: registrationData.district,
        collegeName: registrationData.collegeName,
        collegeAddress: registrationData.collegeAddress,
        paymentScreenshotKey: validatedCheckoutData.paymentScreenshotKey,
        paymentSubmittedAt: new Date(),
        paymentAmount: event.price,
        transactionId: validatedCheckoutData.transactionId || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Automatically sync registration data to user profile
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: registrationData.fullName,
          email: registrationData.email,
          mobileNumber: registrationData.mobileNumber,
          whatsappNumber: registrationData.whatsappNumber || null,
          aadhaarNumber: registrationData.aadhaarNumber,
          state: registrationData.state,
          district: registrationData.district,
          collegeName: registrationData.collegeName,
          collegeAddress: registrationData.collegeAddress,
          updatedAt: new Date(),
        },
      });
      console.log(`User profile updated automatically for user ${session.user.id} from checkout registration`);
    } catch (profileUpdateError) {
      console.error('Failed to auto-update user profile from checkout:', profileUpdateError);
      // Don't fail the registration if profile update fails
    }

    // Send confirmation email with PDF attachment
    try {
      // Format the event date
      const eventDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(event.date));

      // Generate PDF attachment
      const pdfBuffer = await generateRegistrationPDF({
        fullName: registrationData.fullName,
        email: registrationData.email,
        mobileNumber: registrationData.mobileNumber,
        whatsappNumber: registrationData.whatsappNumber,
        aadhaarNumber: registrationData.aadhaarNumber,
        state: registrationData.state,
        district: registrationData.district,
        collegeName: registrationData.collegeName,
        collegeAddress: registrationData.collegeAddress,
        eventTitle: event.title,
        eventDate: eventDate,
        eventVenue: event.venue || 'To be announced',
        registrationId: participation.id,
        price: event.price,
        registeredAt: participation.registeredAt || new Date()
      });

      // Send confirmation email with PDF attachment
      await sendConfirmationEmailWithAttachment({
        to: registrationData.email,
        participantName: participation.user.name || registrationData.fullName,
        eventTitle: event.title,
        eventDate: eventDate,
        eventVenue: event.venue || 'To be announced',
        registrationDetails: {
          fullName: registrationData.fullName,
          mobileNumber: registrationData.mobileNumber,
          whatsappNumber: registrationData.whatsappNumber,
          collegeName: registrationData.collegeName,
          state: registrationData.state,
          district: registrationData.district,
        },
        attachmentBuffer: pdfBuffer,
        attachmentFilename: `registration-${event.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${participation.id.substring(0, 8)}.pdf`
      });

      console.log(`Confirmation email sent to ${registrationData.email} with PDF attachment`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/participate");
    revalidatePath("/admin/participants");

    return {
      status: "success",
      message: `Registration completed successfully! Your payment is under verification and you will be notified once confirmed. Please check your email for registration details.`,
    };
  } catch (error) {
    console.error("Error completing registration:", error);
    return {
      status: "error",
      message: "Failed to complete registration. Please try again.",
    };
  }
}