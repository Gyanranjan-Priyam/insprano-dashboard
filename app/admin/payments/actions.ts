"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendPaymentConfirmationEmail } from "@/lib/mailer";
import { generateInvoicePDF, generateAccommodationInvoicePDF } from "@/lib/invoice-generator";

export interface EventPaymentData {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string | null;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  status: string;
  paymentAmount: number | null;
  paymentSubmittedAt: Date | null;
  paymentVerifiedAt: Date | null;
  transactionId: string | null;
  paymentScreenshotKey: string | null;
  registeredAt: Date;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    createdAt?: Date;
  };
  event: {
    id: string;
    title: string;
    category: string;
    priceType: "free" | "paid";
    price: number;
    date: Date;
    venue?: string;
  };
  teamMembers?: TeamMemberData[];
  isTeamLeader?: boolean;
  paidByTeamLeader?: {
    id: string;
    fullName: string;
    email: string;
    transactionId: string | null;
    paymentSubmittedAt: Date | null;
  } | null;
}

export interface AccommodationPaymentData {
  id: string;
  name: string;
  mobileNumber: string;
  whatsappNumber: string | null;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  totalStayPrice: number;
  selectedMeals: string[];
  totalMealPrice: number;
  totalPrice: number;
  transactionId: string | null;
  paymentScreenshot: string | null;
  upiId: string | null;
  paymentStatus: string;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    createdAt?: Date;
  };
}

export interface TeamMemberData {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string | null;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  status: string;
  paymentAmount: number | null;
  joinedAt: Date;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
  paidByTeamLeader?: {
    id: string;
    fullName: string;
    email: string;
    transactionId: string | null;
    paymentSubmittedAt: Date | null;
  } | null;
}

export async function getAllEventPayments(): Promise<{
  data: EventPaymentData[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { data: [], error: "Authentication required" };
    }

    // Check if user is admin (use session role for consistency)
    if (session.user.role !== "admin") {
      return { data: [], error: "Admin access required" };
    }

    // Get all participations including free events and those with payments
    const participations = await prisma.participation.findMany({
      where: {
        OR: [
          { status: "PAYMENT_SUBMITTED" },
          { status: "CONFIRMED" },
          { status: "CANCELLED" }, // Include cancelled to show payment history
          {
            AND: [
              { paymentSubmittedAt: { not: null } },
              { paymentAmount: { not: null } }
            ]
          },
          // Include REGISTERED status for free events
          {
            AND: [
              { status: "REGISTERED" },
              {
                event: {
                  priceType: "free"
                }
              }
            ]
          }
        ]
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
        paymentAmount: true,
        paymentSubmittedAt: true,
        paymentVerifiedAt: true,
        transactionId: true,
        registeredAt: true,
        paymentScreenshotKey: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            priceType: true,
            price: true,
            date: true,
            venue: true,
          },
        },
        teamLeader: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                id: true,
                joinedAt: true,
                participant: {
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
                    paymentAmount: true,
                    paymentSubmittedAt: true,
                    paymentVerifiedAt: true,
                    transactionId: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        teamMember: {
          select: {
            team: {
              select: {
                leader: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    transactionId: true,
                    paymentSubmittedAt: true,
                    status: true
                  }
                }
              }
            }
          }
        },
      },
      orderBy: [
        { paymentSubmittedAt: "desc" },
        { registeredAt: "desc" },
      ],
    });

    // Process participations to group team members under leaders
    const teamLeaderIds = new Set<string>();
    const processedPayments: EventPaymentData[] = [];

    for (const participation of participations) {
      // Check if this person is a team member (not leader)
      const isTeamMember = participation.teamMember.length > 0;
      
      if (isTeamMember) {
        // Get the team leader ID for this team member
        const leaderId = participation.teamMember[0]?.team?.leader?.id;
        if (leaderId) {
          teamLeaderIds.add(leaderId);
          // Skip adding team members to main list - they'll be nested under leaders
          continue;
        }
      }

      // This is either a team leader or an individual participant
      let paidByTeamLeader = null;
      
      // Check if this person's payment was covered by a team leader
      if (isTeamMember && participation.status === "CONFIRMED" && !participation.paymentSubmittedAt) {
        // This person was likely paid for by their team leader
        const teamLeader = participation.teamMember[0]?.team?.leader;
        if (teamLeader) {
          paidByTeamLeader = {
            id: teamLeader.id,
            fullName: teamLeader.fullName,
            email: teamLeader.email,
            transactionId: teamLeader.transactionId,
            paymentSubmittedAt: teamLeader.paymentSubmittedAt
          };
        }
      }

      const paymentData: EventPaymentData = {
        ...participation,
        teamMembers: [],
        isTeamLeader: participation.teamLeader.length > 0,
        paidByTeamLeader
      };

      // If this is a team leader, add their team members
      if (participation.teamLeader.length > 0) {
        const team = participation.teamLeader[0];
        paymentData.teamMembers = team.members.map(member => {
          // Check if team member's payment was covered by the leader
          let memberPaidByLeader = null;
          if (member.participant.status === "CONFIRMED" && !member.participant.paymentSubmittedAt) {
            memberPaidByLeader = {
              id: participation.id,
              fullName: participation.fullName,
              email: participation.email,
              transactionId: participation.transactionId,
              paymentSubmittedAt: participation.paymentSubmittedAt
            };
          }

          return {
            id: member.participant.id,
            fullName: member.participant.fullName,
            email: member.participant.email,
            mobileNumber: member.participant.mobileNumber,
            whatsappNumber: member.participant.whatsappNumber,
            aadhaarNumber: member.participant.aadhaarNumber,
            state: member.participant.state,
            district: member.participant.district,
            collegeName: member.participant.collegeName,
            collegeAddress: member.participant.collegeAddress,
            status: member.participant.status,
            paymentAmount: member.participant.paymentAmount,
            joinedAt: member.joinedAt,
            user: member.participant.user,
            paidByTeamLeader: memberPaidByLeader
          };
        });
      }

      processedPayments.push(paymentData);
    }

    return { data: processedPayments };
  } catch (error) {
    console.error("Error fetching event payments:", error);
    return { 
      data: [], 
      error: "Failed to fetch payment data. Please try again later." 
    };
  }
}

export async function updatePaymentStatus(
  participationId: string,
  status: "CONFIRMED" | "PAYMENT_SUBMITTED" | "PENDING_PAYMENT" | "CANCELLED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user is admin (use session role for consistency)
    if (session.user.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    const updateData: any = { status };

    // Set verification timestamp if confirming payment
    if (status === "CONFIRMED") {
      updateData.paymentVerifiedAt = new Date();
    }

    await prisma.participation.update({
      where: { id: participationId },
      data: updateData,
    });

    // Auto-send confirmation email when status is updated to CONFIRMED
    if (status === "CONFIRMED") {
      try {
        // Get participation details for invoice generation
        const participationForInvoice = await prisma.participation.findUnique({
          where: { id: participationId },
          include: {
            user: { select: { email: true, name: true } },
            event: { select: { title: true, date: true, venue: true, price: true } },
          },
        });

        if (participationForInvoice) {
          // Generate invoice number
          const invoiceNumber = `INV-${new Date().getFullYear()}-${participationForInvoice.id.substring(0, 8).toUpperCase()}`;

          // Format the event date
          const eventDate = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(participationForInvoice.event.date));

          // Generate invoice PDF
          const invoicePDF = await generateInvoicePDF({
            invoiceNumber,
            fullName: participationForInvoice.fullName,
            email: participationForInvoice.email,
            mobileNumber: participationForInvoice.mobileNumber,
            collegeName: participationForInvoice.collegeName,
            state: participationForInvoice.state,
            district: participationForInvoice.district,
            eventTitle: participationForInvoice.event.title,
            eventDate: eventDate,
            eventVenue: participationForInvoice.event.venue || 'To be announced',
            registrationId: participationForInvoice.id,
            paymentAmount: participationForInvoice.paymentAmount || participationForInvoice.event.price,
            paymentDate: participationForInvoice.paymentSubmittedAt || new Date(),
            paymentVerifiedDate: new Date(),
            transactionId: participationForInvoice.transactionId || undefined,
            paymentMethod: 'Online Transfer'
          });

          // Send payment confirmation email with invoice
          await sendPaymentConfirmationEmail({
            to: participationForInvoice.user.email,
            participantName: participationForInvoice.user.name || participationForInvoice.fullName,
            eventTitle: participationForInvoice.event.title,
            eventDate: eventDate,
            eventVenue: participationForInvoice.event.venue || 'To be announced',
            invoiceNumber,
            paymentAmount: participationForInvoice.paymentAmount || participationForInvoice.event.price,
            registrationDetails: {
              fullName: participationForInvoice.fullName,
              mobileNumber: participationForInvoice.mobileNumber,
              whatsappNumber: participationForInvoice.whatsappNumber || undefined,
              collegeName: participationForInvoice.collegeName,
              state: participationForInvoice.state,
              district: participationForInvoice.district,
            },
            invoiceBuffer: invoicePDF,
            invoiceFilename: `invoice-${participationForInvoice.event.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${invoiceNumber}.pdf`
          });

          console.log(`Payment confirmation email sent to ${participationForInvoice.user.email} with invoice ${invoiceNumber}`);
        }
      } catch (emailError) {
        console.error("Error sending payment confirmation email:", emailError);
        // We don't fail the status update if email fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { 
      success: false, 
      error: "Failed to update payment status. Please try again later." 
    };
  }
}

export async function sendConfirmationEmail(
  participationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user is admin (use session role for consistency)
    if (session.user.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        user: { select: { email: true, name: true } },
        event: { select: { title: true, date: true, venue: true } },
      },
    });

    if (!participation) {
      return { success: false, error: "Participation record not found" };
    }

    // Import the confirmation email function
    const { sendConfirmationEmail: sendEmail } = await import("@/lib/mailer");

    // Format the event date
    const eventDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(participation.event.date));

    // Send the confirmation email
    await sendEmail({
      to: participation.user.email,
      participantName: participation.user.name || participation.fullName,
      eventTitle: participation.event.title,
      eventDate: eventDate,
      eventVenue: participation.event.venue,
      registrationDetails: {
        fullName: participation.fullName,
        mobileNumber: participation.mobileNumber,
        whatsappNumber: participation.whatsappNumber || undefined,
        collegeName: participation.collegeName,
        state: participation.state,
        district: participation.district,
      },
    });

    // console.log("Confirmation email sent to:", participation.user.email);
    // console.log("Event details:", participation.event.title);

    return { success: true };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { 
      success: false, 
      error: "Failed to send confirmation email. Please try again later." 
    };
  }
}

export async function getPaymentById(id: string): Promise<{
  data?: EventPaymentData;
  status: "success" | "error";
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { 
        status: "error", 
        message: "Authentication required" 
      };
    }

    // Check if user is admin (use session role for consistency)
    if (session.user.role !== "admin") {
      return { 
        status: "error", 
        message: "Admin access required" 
      };
    }

    const payment = await prisma.participation.findUnique({
      where: { id },
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
        paymentAmount: true,
        paymentSubmittedAt: true,
        paymentVerifiedAt: true,
        transactionId: true,
        registeredAt: true,
        paymentScreenshotKey: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            priceType: true,
            price: true,
            date: true,
            venue: true,
          },
        },
        teamLeader: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                id: true,
                joinedAt: true,
                participant: {
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
                    paymentAmount: true,
                    paymentSubmittedAt: true,
                    paymentVerifiedAt: true,
                    transactionId: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        teamMember: {
          select: {
            team: {
              select: {
                leader: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    transactionId: true,
                    paymentSubmittedAt: true,
                    status: true
                  }
                }
              }
            }
          }
        },
      },
    });

    if (!payment) {
      return { 
        status: "error", 
        message: "Payment record not found" 
      };
    }

    // Process team data
    let processedPayment: EventPaymentData = {
      ...payment,
      teamMembers: [],
      isTeamLeader: payment.teamLeader.length > 0,
      paidByTeamLeader: null
    };

    // If this is a team leader, add their team members
    if (payment.teamLeader.length > 0) {
      const team = payment.teamLeader[0];
      processedPayment.teamMembers = team.members.map(member => {
        // Check if team member's payment was covered by the leader
        let memberPaidByLeader = null;
        if (member.participant.status === "CONFIRMED" && !member.participant.paymentSubmittedAt) {
          memberPaidByLeader = {
            id: payment.id,
            fullName: payment.fullName,
            email: payment.email,
            transactionId: payment.transactionId,
            paymentSubmittedAt: payment.paymentSubmittedAt
          };
        }

        return {
          id: member.participant.id,
          fullName: member.participant.fullName,
          email: member.participant.email,
          mobileNumber: member.participant.mobileNumber,
          whatsappNumber: member.participant.whatsappNumber,
          aadhaarNumber: member.participant.aadhaarNumber,
          state: member.participant.state,
          district: member.participant.district,
          collegeName: member.participant.collegeName,
          collegeAddress: member.participant.collegeAddress,
          status: member.participant.status,
          paymentAmount: member.participant.paymentAmount,
          joinedAt: member.joinedAt,
          user: member.participant.user,
          paidByTeamLeader: memberPaidByLeader
        };
      });
    }

    // Check if this person is a team member (not leader)
    const isTeamMember = payment.teamMember.length > 0;
    if (isTeamMember && payment.status === "CONFIRMED" && !payment.paymentSubmittedAt) {
      // This person was likely paid for by their team leader
      const teamLeader = payment.teamMember[0]?.team?.leader;
      if (teamLeader) {
        processedPayment.paidByTeamLeader = {
          id: teamLeader.id,
          fullName: teamLeader.fullName,
          email: teamLeader.email,
          transactionId: teamLeader.transactionId,
          paymentSubmittedAt: teamLeader.paymentSubmittedAt
        };
      }
    }

    return { 
      status: "success", 
      data: processedPayment
    };
  } catch (error) {
    console.error("Error fetching payment by ID:", error);
    return { 
      status: "error", 
      message: "Failed to fetch payment details. Please try again later." 
    };
  }
}

export async function getAllAccommodationPayments(): Promise<{
  data: AccommodationPaymentData[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { data: [], error: "Authentication required" };
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return { data: [], error: "Admin access required" };
    }

    // Get only accommodation bookings with payments
    const bookings = await prisma.accommodationBooking.findMany({
      where: {
        OR: [
          { paymentStatus: "VERIFIED" },
          { paymentStatus: "PENDING" },
          { paymentStatus: "FAILED" },
          {
            AND: [
              { transactionId: { not: null } },
              { paymentScreenshot: { not: null } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        whatsappNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
        roomType: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfNights: true,
        totalStayPrice: true,
        selectedMeals: true,
        totalMealPrice: true,
        totalPrice: true,
        transactionId: true,
        paymentScreenshot: true,
        upiId: true,
        paymentStatus: true,
        verifiedAt: true,
        verifiedBy: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
      ],
    });

    // Convert Decimal to number for client components
    const processedBookings: AccommodationPaymentData[] = bookings.map(booking => ({
      ...booking,
      totalStayPrice: Number(booking.totalStayPrice),
      totalMealPrice: Number(booking.totalMealPrice),
      totalPrice: Number(booking.totalPrice),
    }));

    return { data: processedBookings };
  } catch (error) {
    console.error("Error fetching accommodation payments:", error);
    return { 
      data: [], 
      error: "Failed to fetch accommodation payment data. Please try again later." 
    };
  }
}

export async function updateAccommodationPaymentStatus(
  bookingId: string,
  status: "VERIFIED" | "PENDING" | "FAILED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    const updateData: any = { paymentStatus: status };

    // Set verification timestamp and verifier if verifying payment
    if (status === "VERIFIED") {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = session.user.id;
      
      // Send payment confirmation email for accommodation
      try {
        const bookingForInvoice = await prisma.accommodationBooking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { email: true, name: true } },
          },
        });

        if (bookingForInvoice) {
          // Generate invoice number for accommodation
          const invoiceNumber = `ACC-INV-${new Date().getFullYear()}-${bookingForInvoice.id.substring(0, 8).toUpperCase()}`;

          // Generate accommodation invoice PDF
          const invoicePDF = await generateAccommodationInvoicePDF({
            invoiceNumber,
            fullName: bookingForInvoice.name,
            email: bookingForInvoice.user.email,
            mobileNumber: bookingForInvoice.mobileNumber,
            collegeName: bookingForInvoice.collegeName || 'Not specified',
            state: bookingForInvoice.state || 'Not specified',
            district: bookingForInvoice.district || 'Not specified',
            roomType: bookingForInvoice.roomType,
            checkInDate: bookingForInvoice.checkInDate,
            checkOutDate: bookingForInvoice.checkOutDate,
            numberOfNights: bookingForInvoice.numberOfNights,
            stayAmount: Number(bookingForInvoice.totalStayPrice),
            mealAmount: Number(bookingForInvoice.totalMealPrice),
            totalAmount: Number(bookingForInvoice.totalPrice),
            bookingId: bookingForInvoice.id,
            paymentDate: bookingForInvoice.createdAt,
            paymentVerifiedDate: new Date(),
            transactionId: bookingForInvoice.transactionId || undefined,
            paymentMethod: 'Online Transfer',
            selectedMeals: bookingForInvoice.selectedMeals
          });

          // Send payment confirmation email with invoice
          await sendPaymentConfirmationEmail({
            to: bookingForInvoice.user.email,
            participantName: bookingForInvoice.user.name || bookingForInvoice.name,
            eventTitle: `Accommodation Booking - ${bookingForInvoice.roomType}`,
            eventDate: `Check-in: ${bookingForInvoice.checkInDate.toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}`,
            eventVenue: 'GCEK Campus Accommodation',
            invoiceNumber,
            paymentAmount: Number(bookingForInvoice.totalPrice),
            registrationDetails: {
              fullName: bookingForInvoice.name,
              mobileNumber: bookingForInvoice.mobileNumber,
              whatsappNumber: bookingForInvoice.whatsappNumber || undefined,
              collegeName: bookingForInvoice.collegeName || 'Not specified',
              state: bookingForInvoice.state || 'Not specified',
              district: bookingForInvoice.district || 'Not specified',
            },
            invoiceBuffer: invoicePDF,
            invoiceFilename: `accommodation-invoice-${invoiceNumber}.pdf`
          });

          console.log(`Accommodation payment confirmation email sent to ${bookingForInvoice.user.email} with invoice ${invoiceNumber}`);
        }
      } catch (emailError) {
        console.error("Error sending accommodation payment confirmation email:", emailError);
        // We don't fail the status update if email fails
      }
    }

    await prisma.accommodationBooking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating accommodation payment status:", error);
    return { 
      success: false, 
      error: "Failed to update accommodation payment status. Please try again later." 
    };
  }
}

export async function getAccommodationPaymentById(id: string): Promise<{
  data?: AccommodationPaymentData & {
    originalTotalPrice?: number | null;
    originalTransactionId?: string | null;
    originalPaymentScreenshot?: string | null;
    originalPaymentStatus?: string | null;
    hasBeenModified?: boolean;
    paymentHistory?: {
      originalPayment: {
        totalStayPrice: number;
        totalMealPrice: number;
        totalAmount: number;
        transactionId: string | null;
        paymentScreenshot: string | null;
        paymentStatus: string;
        createdAt: Date;
      };
      hasAdditionalPayment: boolean;
      lastModified: Date;
      screenshots: string[];
    } | null;
  };
  status: "success" | "error";
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { 
        status: "error", 
        message: "Authentication required" 
      };
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return { 
        status: "error", 
        message: "Admin access required" 
      };
    }

    const booking = await prisma.accommodationBooking.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        whatsappNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
        roomType: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfNights: true,
        totalStayPrice: true,
        selectedMeals: true,
        totalMealPrice: true,
        totalPrice: true,
        transactionId: true,
        paymentScreenshot: true,
        upiId: true,
        paymentStatus: true,
        verifiedAt: true,
        verifiedBy: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        originalTotalPrice: true,
        originalTransactionId: true,
        originalPaymentScreenshot: true,
        originalPaymentStatus: true,
        hasBeenModified: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return { 
        status: "error", 
        message: "Accommodation booking not found" 
      };
    }

    // Build payment history with all screenshots
    const paymentHistory = booking.hasBeenModified ? {
      originalPayment: {
        totalStayPrice: Number(booking.originalTotalPrice || booking.totalStayPrice),
        totalMealPrice: 0, // Original meal price not tracked separately
        totalAmount: Number(booking.originalTotalPrice || booking.totalStayPrice),
        transactionId: booking.originalTransactionId || null,
        paymentScreenshot: booking.originalPaymentScreenshot || null,
        paymentStatus: booking.originalPaymentStatus || "PENDING",
        createdAt: booking.createdAt
      },
      hasAdditionalPayment: booking.hasBeenModified,
      lastModified: booking.updatedAt,
      screenshots: [
        booking.originalPaymentScreenshot,
        booking.paymentScreenshot
      ].filter(Boolean) as string[]
    } : {
      originalPayment: {
        totalStayPrice: Number(booking.totalStayPrice),
        totalMealPrice: Number(booking.totalMealPrice),
        totalAmount: Number(booking.totalPrice),
        transactionId: booking.transactionId || null,
        paymentScreenshot: booking.paymentScreenshot || null,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      },
      hasAdditionalPayment: false,
      lastModified: booking.updatedAt,
      screenshots: [booking.paymentScreenshot].filter(Boolean) as string[]
    };

    // Convert Decimal to number for client components
    const processedBooking = {
      ...booking,
      totalStayPrice: Number(booking.totalStayPrice),
      totalMealPrice: Number(booking.totalMealPrice),
      totalPrice: Number(booking.totalPrice),
      originalTotalPrice: booking.originalTotalPrice ? Number(booking.originalTotalPrice) : null,
      paymentHistory
    };

    return { 
      status: "success", 
      data: processedBooking
    };
  } catch (error) {
    console.error("Error fetching accommodation payment by ID:", error);
    return { 
      status: "error", 
      message: "Failed to fetch accommodation payment details. Please try again later." 
    };
  }
}

export async function sendAccommodationConfirmationEmail(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    const booking = await prisma.accommodationBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking record not found" };
    }

    // Import the generic email function
    const { sendEmail } = await import("@/lib/mailer");

    // Format the dates
    const checkInDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(booking.checkInDate));

    const checkOutDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(booking.checkOutDate));

    // Create accommodation confirmation email content
    const emailSubject = `🏨 Accommodation Booking Confirmed - ${booking.name}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accommodation Booking Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏨 Booking Confirmed!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Dear ${booking.name},</h2>
          <p>Your accommodation booking has been confirmed! Here are your booking details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">📋 Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Guest Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Mobile Number:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.mobileNumber}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Room Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.roomType}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Check-in Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${checkInDate}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Check-out Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${checkOutDate}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Number of Nights:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.numberOfNights}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">₹${Number(booking.totalPrice).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Payment Status:</strong></td><td style="padding: 8px 0;"><span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${booking.paymentStatus}</span></td></tr>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1976d2;">📍 Important Information</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Please carry a valid photo ID for check-in</li>
              <li>Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              <li>Keep this email as your booking confirmation</li>
            </ul>
          </div>
          
          <p>If you have any questions or need to make changes to your booking, please contact us.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Accommodation Team</strong><br>
            <em>Thank you for choosing us!</em>
          </p>
        </div>
      </body>
      </html>
    `;

    // Send the confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending accommodation confirmation email:", error);
    return { 
      success: false, 
      error: "Failed to send confirmation email. Please try again later." 
    };
  }
}

export async function getPaymentStatistics(): Promise<{
  data: {
    totalPayments: number;
    confirmedPayments: number;
    pendingPayments: number;
    totalRevenue: number;
    eventPayments: {
      total: number;
      confirmed: number;
      pending: number;
      revenue: number;
    };
    accommodationPayments: {
      total: number;
      verified: number;
      pending: number;
      revenue: number;
    };
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { 
        data: { 
          totalPayments: 0, 
          confirmedPayments: 0, 
          pendingPayments: 0, 
          totalRevenue: 0,
          eventPayments: { total: 0, confirmed: 0, pending: 0, revenue: 0 },
          accommodationPayments: { total: 0, verified: 0, pending: 0, revenue: 0 }
        },
        error: "Authentication required" 
      };
    }

    // Check if user is admin (use session role for consistency)
    if (session.user.role !== "admin") {
      return { 
        data: { 
          totalPayments: 0, 
          confirmedPayments: 0, 
          pendingPayments: 0, 
          totalRevenue: 0,
          eventPayments: { total: 0, confirmed: 0, pending: 0, revenue: 0 },
          accommodationPayments: { total: 0, verified: 0, pending: 0, revenue: 0 }
        },
        error: "Admin access required" 
      };
    }

    const [
      // Event payments
      totalEventPayments,
      confirmedEventPayments,
      pendingEventPayments,
      eventRevenueData,
      // Accommodation payments
      totalAccommodationPayments,
      verifiedAccommodationPayments,
      pendingAccommodationPayments,
      accommodationRevenueData,
    ] = await Promise.all([
      // Event payment counts
      prisma.participation.count({
        where: {
          OR: [
            { status: "PAYMENT_SUBMITTED" },
            { status: "CONFIRMED" },
            { status: "CANCELLED" },
            {
              AND: [
                { paymentSubmittedAt: { not: null } },
                { paymentAmount: { not: null } }
              ]
            }
          ]
        }
      }),
      prisma.participation.count({
        where: { status: "CONFIRMED" },
      }),
      prisma.participation.count({
        where: { status: { in: ["PENDING_PAYMENT", "PAYMENT_SUBMITTED"] } },
      }),
      prisma.participation.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { paymentAmount: true },
      }),
      // Accommodation payment counts
      prisma.accommodationBooking.count({
        where: {
          OR: [
            { paymentStatus: "VERIFIED" },
            { paymentStatus: "PENDING" },
            { paymentStatus: "FAILED" },
            {
              AND: [
                { transactionId: { not: null } },
                { paymentScreenshot: { not: null } }
              ]
            }
          ]
        }
      }),
      prisma.accommodationBooking.count({
        where: { paymentStatus: "VERIFIED" },
      }),
      prisma.accommodationBooking.count({
        where: { paymentStatus: "PENDING" },
      }),
      prisma.accommodationBooking.aggregate({
        where: { paymentStatus: "VERIFIED" },
        _sum: { totalPrice: true },
      }),
    ]);

    const eventRevenue = eventRevenueData._sum.paymentAmount || 0;
    const accommodationRevenue = Number(accommodationRevenueData._sum.totalPrice || 0);

    return {
      data: {
        totalPayments: totalEventPayments + totalAccommodationPayments,
        confirmedPayments: confirmedEventPayments + verifiedAccommodationPayments,
        pendingPayments: pendingEventPayments + pendingAccommodationPayments,
        totalRevenue: eventRevenue + accommodationRevenue,
        eventPayments: {
          total: totalEventPayments,
          confirmed: confirmedEventPayments,
          pending: pendingEventPayments,
          revenue: eventRevenue
        },
        accommodationPayments: {
          total: totalAccommodationPayments,
          verified: verifiedAccommodationPayments,
          pending: pendingAccommodationPayments,
          revenue: accommodationRevenue
        }
      },
    };
  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    return { 
      data: { 
        totalPayments: 0, 
        confirmedPayments: 0, 
        pendingPayments: 0, 
        totalRevenue: 0,
        eventPayments: { total: 0, confirmed: 0, pending: 0, revenue: 0 },
        accommodationPayments: { total: 0, verified: 0, pending: 0, revenue: 0 }
      },
      error: "Failed to fetch payment statistics" 
    };
  }
}