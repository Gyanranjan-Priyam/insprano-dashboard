"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Types for report data
export interface TeamReportData {
  id: string;
  teamName: string;
  eventTitle: string;
  eventCategory: string;
  leaderName: string;
  leaderEmail: string;
  memberCount: number;
  memberNames: string[]; // Array of member names
  membersList: string; // Comma-separated member names for display
  totalAmount: number;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

// Comprehensive team data for detailed export
export interface ComprehensiveTeamData {
  id: string;
  teamName: string;
  teamCode: string;
  eventTitle: string;
  eventCategory: string;
  eventPrice: number;
  eventDate: Date;
  eventVenue: string;
  
  // Leader Details
  leaderName: string;
  leaderEmail: string;
  leaderMobile: string;
  leaderWhatsapp: string;
  leaderAadhaar: string;
  leaderState: string;
  leaderDistrict: string;
  leaderCollege: string;
  leaderCollegeAddress: string;
  
  // Payment Details
  paymentAmount: number;
  paymentStatus: string;
  transactionId: string;
  paymentSubmittedAt: Date | null;
  paymentVerifiedAt: Date | null;
  
  // Team Details
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  description: string;
  
  // Members Details
  members: {
    name: string;
    email: string;
    mobile: string;
    whatsapp: string;
    state: string;
    district: string;
    college: string;
    joinedDate: Date;
    status: string;
  }[];
  
  // Timeline
  teamCreatedAt: Date;
  teamUpdatedAt: Date;
}

export interface PaymentReportData {
  id: string;
  participantName: string;
  email: string;
  eventTitle: string;
  eventCategory: string;
  paymentAmount: number;
  paymentStatus: string;
  transactionId: string | null;
  paymentType: "INDIVIDUAL" | "TEAM";
  submittedAt: Date | null;
  verifiedAt: Date | null;
}

// Comprehensive payment data for detailed export
export interface ComprehensivePaymentData {
  id: string;
  paymentType: "EVENT" | "ACCOMMODATION";
  
  // Participant Details
  participantName: string;
  participantEmail: string;
  participantMobile: string;
  participantWhatsapp: string;
  participantAadhaar: string;
  participantState: string;
  participantDistrict: string;
  participantCollege: string;
  participantCollegeAddress: string;
  
  // Event/Service Details
  eventTitle: string;
  eventCategory: string;
  eventPrice: number;
  eventDate: Date | null;
  eventVenue: string;
  
  // Accommodation Details (if applicable)
  roomType: string;
  numberOfNights: number;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  accommodationPrice: number;
  
  // Payment Details
  paymentAmount: number;
  paymentStatus: string;
  transactionId: string;
  paymentMethod: string;
  isTeamPayment: boolean;
  teamName: string;
  teamRole: string;
  
  // Timeline
  registeredAt: Date | null;
  paymentSubmittedAt: Date | null;
  paymentVerifiedAt: Date | null;
  
  // Additional Info
  verifiedBy: string;
  paymentNotes: string;
}

export interface ParticipantReportData {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  collegeName: string;
  state: string;
  district: string;
  eventsCount: number;
  teamName: string | null;
  registrationStatus: string;
  registeredAt: Date;
  lastActivity: Date;
}

// Comprehensive participant data for detailed export
export interface ComprehensiveParticipantData {
  // Basic Info
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  aadhaarNumber: string;
  
  // Location
  state: string;
  district: string;
  
  // Education
  collegeName: string;
  collegeAddress: string;
  
  // Account Info
  userCreatedAt: Date;
  
  // Events
  events: {
    eventTitle: string;
    eventCategory: string;
    eventPrice: number;
    registrationStatus: string;
    paymentAmount: number;
    transactionId: string | null;
    registeredAt: Date;
    paymentSubmittedAt: Date | null;
    paymentVerifiedAt: Date | null;
  }[];
  
  // Team Info
  teamRole: string; // 'Leader', 'Member', 'Individual'
  teamName: string | null;
  teamMembersCount: number;
  teamMembers: string[]; // Names of team members
  
  // Payment Summary
  totalEventPayments: number;
  totalPaymentAmount: number;
  paymentStatus: string;
  
  // Accommodation
  accommodations: {
    roomType: string;
    numberOfNights: number;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    paymentStatus: string;
    transactionId: string | null;
    createdAt: Date;
    verifiedAt: Date | null;
  }[];
  
  // Summary
  eventsCount: number;
  accommodationsCount: number;
  registrationStatus: string;
  lastActivity: Date;
}

// Get teams report data
export async function getTeamsReportData(): Promise<{
  data?: TeamReportData[];
  status: "success" | "error";
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { 
        status: "error", 
        message: "Admin access required" 
      };
    }

    const teams = await prisma.team.findMany({
      include: {
        event: {
          select: {
            title: true,
            category: true,
            price: true,
          }
        },
        leader: {
          select: {
            fullName: true,
            email: true,
            paymentAmount: true,
            status: true,
          }
        },
        members: {
          where: {
            isActive: true,
            participant: {
              user: {
                role: { not: "admin" }
              }
            }
          },
          select: {
            id: true,
            participant: {
              select: {
                user: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      where: {
        leader: {
          user: {
            role: { not: "admin" }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const processedTeams: TeamReportData[] = teams.map((team: any) => {
      // Extract member names from the members array
      const memberNames = team.members?.map((member: any) => 
        member.participant?.user?.name || 'Unknown'
      ) || [];
      
      return {
        id: team.id,
        teamName: team.name,
        eventTitle: team.event?.title || '',
        eventCategory: team.event?.category || '',
        leaderName: team.leader?.fullName || '',
        leaderEmail: team.leader?.email || '',
        memberCount: (team.members?.length || 0) + 1, // +1 for leader
        memberNames: memberNames,
        membersList: memberNames.join(', '),
        totalAmount: Number(team.leader?.paymentAmount || 0),
        paymentStatus: team.leader?.status || 'PENDING',
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      };
    });

    return { 
      status: "success", 
      data: processedTeams 
    };
  } catch (error) {
    console.error("Error fetching teams report:", error);
    return { 
      status: "error", 
      message: "Failed to fetch teams data" 
    };
  }
}

// Get payments report data
export async function getPaymentsReportData(): Promise<{
  data?: PaymentReportData[];
  status: "success" | "error";
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { 
        status: "error", 
        message: "Admin access required" 
      };
    }

    // Get individual event payments
    const eventPayments = await prisma.participation.findMany({
      where: {
        paymentAmount: { not: null },
        user: {
          role: { not: "admin" }
        }
      },
      include: {
        event: {
          select: {
            title: true,
            category: true,
          }
        },
        teamLeader: {
          select: {
            id: true,
          }
        }
      },
      orderBy: { paymentSubmittedAt: 'desc' }
    });

    // Get accommodation payments
    const accommodationPayments = await prisma.accommodationBooking.findMany({
      where: {
        paymentStatus: { not: "PENDING" },
        user: {
          role: { not: "admin" }
        }
      },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    });

    const processedPayments: PaymentReportData[] = [
      // Event payments
      ...eventPayments.map(payment => ({
        id: payment.id,
        participantName: payment.fullName,
        email: payment.email,
        eventTitle: payment.event.title,
        eventCategory: payment.event.category,
        paymentAmount: Number(payment.paymentAmount || 0),
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        paymentType: (payment.teamLeader.length > 0 ? "TEAM" : "INDIVIDUAL") as "INDIVIDUAL" | "TEAM",
        submittedAt: payment.paymentSubmittedAt,
        verifiedAt: payment.paymentVerifiedAt,
      })),
      // Accommodation payments
      ...accommodationPayments.map(payment => ({
        id: payment.id,
        participantName: payment.name,
        email: payment.user.email,
        eventTitle: "Accommodation Booking",
        eventCategory: "Accommodation",
        paymentAmount: Number(payment.totalPrice),
        paymentStatus: payment.paymentStatus,
        transactionId: payment.transactionId,
        paymentType: "INDIVIDUAL" as "INDIVIDUAL" | "TEAM",
        submittedAt: payment.createdAt,
        verifiedAt: payment.verifiedAt,
      }))
    ];

    // Sort by submission date
    processedPayments.sort((a, b) => {
      const aDate = a.submittedAt ? new Date(a.submittedAt) : new Date(0);
      const bDate = b.submittedAt ? new Date(b.submittedAt) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return { 
      status: "success", 
      data: processedPayments 
    };
  } catch (error) {
    console.error("Error fetching payments report:", error);
    return { 
      status: "error", 
      message: "Failed to fetch payments data" 
    };
  }
}

// Get participants report data
export async function getParticipantsReportData(): Promise<{
  data?: ParticipantReportData[];
  status: "success" | "error";
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { 
        status: "error", 
        message: "Admin access required" 
      };
    }

    const participants = await prisma.user.findMany({
      where: {
        role: { not: "admin" },
        participations: {
          some: {} // Only include users who have at least one participation
        }
      },
      include: {
        participations: {
          select: {
            id: true,
            paymentAmount: true,
            registeredAt: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get team information separately
    const teamLeaders = await prisma.team.findMany({
      include: {
        leader: {
          select: {
            userId: true,
          }
        }
      }
    });

    const teamMembers = await prisma.teamMember.findMany({
      include: {
        participant: {
          select: {
            userId: true,
          }
        },
        team: {
          select: {
            name: true,
          }
        }
      }
    });

    const processedParticipants: ParticipantReportData[] = participants.map(participant => {
      const eventsCount = participant.participations.length;
      
      // Get team name - check if user is team leader or member
      let teamName: string | null = null;
      
      // Check if user leads any team
      const leaderTeam = teamLeaders.find(team => team.leader.userId === participant.id);
      if (leaderTeam) {
        teamName = leaderTeam.name;
      }
      
      // If not a leader, check if user is a team member
      if (!teamName) {
        const memberTeam = teamMembers.find(tm => tm.participant.userId === participant.id);
        if (memberTeam) {
          teamName = memberTeam.team.name;
        }
      }
      
      // Determine registration status
      const hasVerifiedPayments = participant.participations.some((p: any) => p.status === "CONFIRMED");
      const hasPendingPayments = participant.participations.some((p: any) => p.status === "PENDING_PAYMENT");
      let registrationStatus = "REGISTERED";
      if (hasVerifiedPayments) registrationStatus = "ACTIVE";
      if (hasPendingPayments && !hasVerifiedPayments) registrationStatus = "PENDING";

      // Get last activity date
      const lastParticipation = participant.participations.sort((a: any, b: any) => 
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      )[0];
      const lastActivity = lastParticipation ? lastParticipation.registeredAt : participant.createdAt;

      return {
        id: participant.id,
        fullName: participant.name || "Unknown",
        email: participant.email,
        mobileNumber: participant.mobileNumber || "",
        collegeName: participant.collegeName || "",
        state: participant.state || "",
        district: participant.district || "",
        eventsCount,
        teamName,
        registrationStatus,
        registeredAt: participant.createdAt,
        lastActivity,
      };
    });

    return { 
      status: "success", 
      data: processedParticipants 
    };
  } catch (error) {
    console.error("Error fetching participants report:", error);
    return { 
      status: "error", 
      message: "Failed to fetch participants data" 
    };
  }
}

// Get comprehensive participants data for detailed export
export async function getComprehensiveParticipantsData(): Promise<{
  data?: ComprehensiveParticipantData[];
  status: "success" | "error";
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { 
        status: "error", 
        message: "Admin access required" 
      };
    }

    const participants = await prisma.user.findMany({
      where: {
        role: { not: "admin" },
        participations: {
          some: {} // Only include users who have at least one participation
        }
      },
      include: {
        participations: {
          include: {
            event: {
              select: {
                title: true,
                category: true,
                price: true,
              }
            },
            teamLeader: {
              include: {
                members: {
                  include: {
                    participant: {
                      select: {
                        fullName: true,
                      }
                    }
                  }
                }
              }
            },
            teamMember: {
              include: {
                team: {
                  include: {
                    leader: {
                      select: {
                        fullName: true,
                      }
                    },
                    members: {
                      include: {
                        participant: {
                          select: {
                            fullName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        accommodationBookings: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const comprehensiveData: ComprehensiveParticipantData[] = participants.map(participant => {
      // Process events data
      const events = participant.participations.map((p: any) => ({
        eventTitle: p.event.title,
        eventCategory: p.event.category,
        eventPrice: Number(p.event.price),
        registrationStatus: p.status,
        paymentAmount: Number(p.paymentAmount || 0),
        transactionId: p.transactionId,
        registeredAt: p.registeredAt,
        paymentSubmittedAt: p.paymentSubmittedAt,
        paymentVerifiedAt: p.paymentVerifiedAt,
      }));

      // Process team info
      let teamRole = "Individual";
      let teamName: string | null = null;
      let teamMembersCount = 0;
      let teamMembers: string[] = [];

      // Check if user is a team leader in any participation
      const teamLeaderParticipation = participant.participations.find((p: any) => p.teamLeader.length > 0);
      if (teamLeaderParticipation) {
        teamRole = "Leader";
        const team = teamLeaderParticipation.teamLeader[0];
        teamName = team.name;
        teamMembersCount = team.members.length; // Don't count leader as member
        teamMembers = team.members.map((m: any) => m.participant.fullName);
      } else {
        // Check if user is a team member in any participation
        const teamMemberParticipation = participant.participations.find((p: any) => p.teamMember.length > 0);
        if (teamMemberParticipation) {
          teamRole = "Member";
          const teamMembership = teamMemberParticipation.teamMember[0];
          const team = teamMembership.team;
          teamName = team.name;
          teamMembersCount = team.members.length; // Don't count leader as member
          teamMembers = [
            team.leader.fullName,
            ...team.members
              .filter((m: any) => m.participant.fullName !== participant.name)
              .map((m: any) => m.participant.fullName)
          ];
        }
      }

      // Process accommodation data
      const accommodations = participant.accommodationBookings.map((booking: any) => ({
        roomType: booking.roomType,
        numberOfNights: booking.numberOfNights,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: Number(booking.totalPrice),
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        createdAt: booking.createdAt,
        verifiedAt: booking.verifiedAt,
      }));

      // Calculate payment summary
      const totalEventPayments = events.reduce((sum: number, event: any) => sum + event.paymentAmount, 0);
      const totalAccommodationPayments = accommodations.reduce((sum: number, acc: any) => sum + acc.totalPrice, 0);
      const totalPaymentAmount = totalEventPayments + totalAccommodationPayments;

      // Determine overall payment status
      const hasVerifiedEventPayments = events.some((e: any) => e.registrationStatus === "CONFIRMED");
      const hasVerifiedAccommodations = accommodations.some((a: any) => a.paymentStatus === "VERIFIED");
      const hasPendingEventPayments = events.some((e: any) => e.registrationStatus === "PENDING_PAYMENT" || e.registrationStatus === "PAYMENT_SUBMITTED");
      const hasPendingAccommodations = accommodations.some((a: any) => a.paymentStatus === "PENDING");

      let paymentStatus = "REGISTERED";
      if (hasVerifiedEventPayments || hasVerifiedAccommodations) paymentStatus = "VERIFIED";
      else if (hasPendingEventPayments || hasPendingAccommodations) paymentStatus = "PENDING";

      // Determine registration status
      let registrationStatus = "REGISTERED";
      if (hasVerifiedEventPayments) registrationStatus = "ACTIVE";
      else if (hasPendingEventPayments && !hasVerifiedEventPayments) registrationStatus = "PENDING";

      // Get last activity date
      const lastEventActivity = events.length > 0 ? 
        Math.max(...events.map((e: any) => new Date(e.registeredAt).getTime())) : 0;
      const lastAccommodationActivity = accommodations.length > 0 ? 
        Math.max(...accommodations.map((a: any) => new Date(a.createdAt).getTime())) : 0;
      const lastActivity = new Date(Math.max(
        lastEventActivity, 
        lastAccommodationActivity, 
        new Date(participant.createdAt).getTime()
      ));

      return {
        // Basic Info
        id: participant.id,
        fullName: participant.name || "Unknown",
        email: participant.email,
        mobileNumber: participant.mobileNumber || "",
        whatsappNumber: participant.whatsappNumber || "",
        aadhaarNumber: participant.aadhaarNumber || "",
        
        // Location
        state: participant.state || "",
        district: participant.district || "",
        
        // Education
        collegeName: participant.collegeName || "",
        collegeAddress: participant.collegeAddress || "",
        
        // Account Info
        userCreatedAt: participant.createdAt,
        
        // Events
        events,
        
        // Team Info
        teamRole,
        teamName,
        teamMembersCount,
        teamMembers,
        
        // Payment Summary
        totalEventPayments,
        totalPaymentAmount,
        paymentStatus,
        
        // Accommodation
        accommodations,
        
        // Summary
        eventsCount: events.length,
        accommodationsCount: accommodations.length,
        registrationStatus,
        lastActivity,
      };
    });

    return { 
      status: "success", 
      data: comprehensiveData 
    };
  } catch (error) {
    console.error("Error fetching comprehensive participants data:", error);
    return { 
      status: "error", 
      message: "Failed to fetch comprehensive participants data" 
    };
  }
}