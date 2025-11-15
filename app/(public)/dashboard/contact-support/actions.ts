"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema for support ticket
const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  mobileNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INSP-${timestamp}-${random}`;
}

export async function getUserProfileForSupport() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
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
      },
    });

    if (!user) {
      return {
        status: "error" as const,
        message: "User not found",
      };
    }

    return {
      status: "success" as const,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user profile for support:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch user profile",
    };
  }
}

export async function createSupportTicket(
  data: z.infer<typeof supportTicketSchema>,
  attachments: Array<{ fileName: string; fileKey: string; fileSize: number; mimeType: string }>
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    // Validate the input data
    const validatedData = supportTicketSchema.parse(data);

    // Generate unique ticket number
    let ticketNumber: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      ticketNumber = generateTicketNumber();
      const existingTicket = await prisma.supportTicket.findUnique({
        where: { ticketNumber }
      });
      isUnique = !existingTicket;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return {
        status: "error" as const,
        message: "Failed to generate unique ticket number. Please try again.",
      };
    }

    // Create support ticket with attachments
    const ticket = await prisma.$transaction(async (tx) => {
      // Create the support ticket
      const newTicket = await tx.supportTicket.create({
        data: {
          ticketNumber: ticketNumber!,
          userId: session.user.id,
          name: validatedData.name,
          email: validatedData.email,
          mobileNumber: validatedData.mobileNumber || null,
          whatsappNumber: validatedData.whatsappNumber || null,
          subject: validatedData.subject,
          message: validatedData.message,
        },
      });

      // Create attachments if any
      if (attachments.length > 0) {
        await tx.supportAttachment.createMany({
          data: attachments.map(attachment => ({
            ticketId: newTicket.id,
            fileName: attachment.fileName,
            fileKey: attachment.fileKey,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
          })),
        });
      }

      return newTicket;
    });

    // TODO: Send email notification to support team

    revalidatePath("/dashboard/contact-support");

    return {
      status: "success" as const,
      message: `Support ticket created successfully! Your ticket number is ${ticketNumber}. We will get back to you soon.`,
      data: { ticketNumber: ticketNumber! },
    };
  } catch (error) {
    console.error("Error creating support ticket:", error);
    
    if (error instanceof z.ZodError) {
      return {
        status: "error" as const,
        message: "Please check your input data and try again.",
      };
    }

    return {
      status: "error" as const,
      message: "Failed to create support ticket. Please try again.",
    };
  }
}

export async function getUserSupportTickets() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        status: "error" as const,
        message: "Authentication required",
      };
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
          }
        },
        _count: {
          select: {
            responses: {
              where: {
                isInternal: false
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: "success" as const,
      data: tickets,
    };
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch support tickets",
    };
  }
}