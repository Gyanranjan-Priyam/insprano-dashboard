"use server";

import { registerForEvent } from "@/app/data/public/participations";
import { ApiResponse } from "@/lib/types";
import { participationSchema, ParticipationSchemaType } from "@/lib/zodSchema";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendConfirmationEmailWithAttachment } from "@/lib/mailer";
import { generateRegistrationPDF } from "@/lib/pdf-generator";

export async function registerForEventAction(eventId: string): Promise<ApiResponse> {
    try {
        await registerForEvent(eventId);
        
        return {
            status: "success",
            message: "Successfully registered for the event!"
        };
    } catch (error: any) {
        console.error("Failed to register for event:", error);
        
        return {
            status: "error",
            message: error.message || "Failed to register for event"
        };
    }
}

export async function registerWithDetailsAction(
    eventId: string, 
    details: ParticipationSchemaType
): Promise<ApiResponse> {
    try {
        // Validate the input data
        const validation = participationSchema.safeParse(details);
        
        if (!validation.success) {
            return {
                status: "error",
                message: "Invalid form data. Please check all fields."
            };
        }

        // Get current user session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return {
                status: "error",
                message: "User not authenticated"
            };
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                title: true,
                date: true,
                venue: true,
                price: true
            }
        });

        if (!event) {
            return {
                status: "error",
                message: "Event not found"
            };
        }

        // Check if user is already registered
        const existingParticipation = await prisma.participation.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId: eventId
                }
            }
        });

        if (existingParticipation) {
            return {
                status: "error",
                message: "You are already registered for this event"
            };
        }

        // Create participation record with details
        const participation = await prisma.participation.create({
            data: {
                userId: session.user.id,
                eventId: eventId,
                fullName: validation.data.fullName,
                email: validation.data.email,
                mobileNumber: validation.data.mobileNumber,
                whatsappNumber: validation.data.whatsappNumber || null,
                aadhaarNumber: validation.data.aadhaarNumber,
                state: validation.data.state,
                district: validation.data.district,
                collegeName: validation.data.collegeName,
                collegeAddress: validation.data.collegeAddress,
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
                    name: validation.data.fullName,
                    email: validation.data.email,
                    mobileNumber: validation.data.mobileNumber,
                    whatsappNumber: validation.data.whatsappNumber || null,
                    aadhaarNumber: validation.data.aadhaarNumber,
                    state: validation.data.state,
                    district: validation.data.district,
                    collegeName: validation.data.collegeName,
                    collegeAddress: validation.data.collegeAddress,
                    updatedAt: new Date(),
                },
            });
            console.log(`User profile updated automatically for user ${session.user.id} from event registration`);
        } catch (profileUpdateError) {
            console.error('Failed to auto-update user profile:', profileUpdateError);
            // Don't fail the registration if profile update fails
        }

        // Send confirmation email with PDF attachment (for free events)
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
                fullName: validation.data.fullName,
                email: validation.data.email,
                mobileNumber: validation.data.mobileNumber,
                whatsappNumber: validation.data.whatsappNumber,
                aadhaarNumber: validation.data.aadhaarNumber,
                state: validation.data.state,
                district: validation.data.district,
                collegeName: validation.data.collegeName,
                collegeAddress: validation.data.collegeAddress,
                eventTitle: event.title,
                eventDate: eventDate,
                eventVenue: event.venue || 'To be announced',
                registrationId: participation.id,
                price: event.price || 0,
                registeredAt: participation.registeredAt || new Date()
            });

            // Send confirmation email with PDF attachment
            await sendConfirmationEmailWithAttachment({
                to: validation.data.email,
                participantName: participation.user.name || validation.data.fullName,
                eventTitle: event.title,
                eventDate: eventDate,
                eventVenue: event.venue || 'To be announced',
                registrationDetails: {
                    fullName: validation.data.fullName,
                    mobileNumber: validation.data.mobileNumber,
                    whatsappNumber: validation.data.whatsappNumber,
                    collegeName: validation.data.collegeName,
                    state: validation.data.state,
                    district: validation.data.district,
                },
                attachmentBuffer: pdfBuffer,
                attachmentFilename: `registration-${event.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${participation.id.substring(0, 8)}.pdf`
            });

            console.log(`Confirmation email sent to ${validation.data.email} with PDF attachment`);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the registration if email fails
        }

        return {
            status: "success",
            message: "Registration completed successfully! You are now registered for the event. Please check your email for confirmation details."
        };
    } catch (error: any) {
        console.error("Failed to register with details:", error);
        
        return {
            status: "error",
            message: error.message || "Failed to complete registration"
        };
    }
}