"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { syncUserProfileFromTeamMemberData } from "./teams/actions";

export interface DashboardStats {
  totalRegistrations: number;
  pendingPayments: number;
  confirmedEvents: number;
  totalSpent: number;
  teamsJoined: number;
  teamsLeading: number;
}

export interface UserParticipation {
  id: string;
  status: string;
  registeredAt: Date;
  paymentSubmittedAt: Date | null;
  paymentVerifiedAt: Date | null;
  paymentAmount: number | null;
  transactionId: string | null;
  event: {
    id: string;
    title: string;
    slugId: string;
    category: string;
    date: Date;
    venue: string;
    price: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'payment_submitted' | 'payment_verified' | 'team_joined' | 'team_created';
  title: string;
  description: string;
  date: Date;
  eventTitle?: string;
  teamName?: string;
}

export async function getUserDashboardData() {
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

    // Sync user profile with team member data if available (only if user has an email)
    if (session.user.email) {
      try {
        await syncUserProfileFromTeamMemberData(session.user.email, session.user.id);
      } catch (error) {
        // Don't fail the dashboard load if sync fails, just log the error
        console.error("Failed to sync user profile from team member data:", error);
      }
    }

    // Get user participations with event details
    const participations = await prisma.participation.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slugId: true,
            category: true,
            date: true,
            venue: true,
            price: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    // Get user's participation IDs first
    const userParticipationIds = participations.map(p => p.id);

    // Get team memberships using participation IDs
    const teamMemberships = await prisma.teamMember.findMany({
      where: { 
        participantId: { 
          in: userParticipationIds 
        } 
      },
      include: {
        team: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                category: true,
                date: true,
              },
            },
            leader: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            members: {
              include: {
                participant: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Get team leaderships using participation IDs
    const teamLeaderships = await prisma.team.findMany({
      where: { 
        leaderId: {
          in: userParticipationIds
        }
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
          },
        },
        members: {
          include: {
            participant: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate dashboard statistics
    const stats: DashboardStats = {
      totalRegistrations: participations.length,
      pendingPayments: participations.filter(p => 
        p.status === 'PAYMENT_SUBMITTED' || p.status === 'REGISTERED'
      ).length,
      confirmedEvents: participations.filter(p => 
        p.status === 'CONFIRMED'
      ).length,
      totalSpent: participations
        .filter(p => p.status === 'CONFIRMED')
        .reduce((sum, p) => sum + (p.paymentAmount || p.event.price), 0),
      teamsJoined: teamMemberships.length,
      teamsLeading: teamLeaderships.length,
    };

    // Generate recent activities
    const activities: RecentActivity[] = [];

    // Add participation activities
    participations.forEach(participation => {
      // Registration activity
      activities.push({
        id: `reg-${participation.id}`,
        type: 'registration',
        title: 'Event Registration',
        description: `Registered for ${participation.event.title}`,
        date: participation.registeredAt,
        eventTitle: participation.event.title,
      });

      // Payment submitted activity
      if (participation.paymentSubmittedAt) {
        activities.push({
          id: `pay-sub-${participation.id}`,
          type: 'payment_submitted',
          title: 'Payment Submitted',
          description: `Payment submitted for ${participation.event.title}`,
          date: participation.paymentSubmittedAt,
          eventTitle: participation.event.title,
        });
      }

      // Payment verified activity
      if (participation.paymentVerifiedAt) {
        activities.push({
          id: `pay-ver-${participation.id}`,
          type: 'payment_verified',
          title: 'Payment Confirmed',
          description: `Payment confirmed for ${participation.event.title}`,
          date: participation.paymentVerifiedAt,
          eventTitle: participation.event.title,
        });
      }
    });

    // Add team activities for leaderships
    teamLeaderships.forEach(team => {
      activities.push({
        id: `team-leader-${team.id}`,
        type: 'team_created',
        title: 'Created Team',
        description: `Created team "${team.name}" for ${team.event.title}`,
        date: team.createdAt,
        eventTitle: team.event.title,
        teamName: team.name,
      });
    });

    // Add team activities for memberships
    teamMemberships.forEach(membership => {
      activities.push({
        id: `team-${membership.id}`,
        type: 'team_joined',
        title: 'Joined Team',
        description: `Joined team "${membership.team.name}" for ${membership.team.event.title}`,
        date: membership.joinedAt,
        eventTitle: membership.team.event.title,
        teamName: membership.team.name,
      });
    });

    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      status: "success" as const,
      data: {
        stats,
        participations,
        teamMemberships,
        teamLeaderships,
        recentActivities: activities.slice(0, 10), // Last 10 activities
        user: {
          name: session.user.name,
          email: session.user.email,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch dashboard data",
    };
  }
}

export async function getUpcomingEvents() {
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

    // Get upcoming events that the user hasn't registered for
    const userEventIds = await prisma.participation.findMany({
      where: { userId: session.user.id },
      select: { eventId: true },
    });

    const registeredEventIds = userEventIds.map(p => p.eventId);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        id: { notIn: registeredEventIds },
      },
      select: {
        id: true,
        slugId: true,
        title: true,
        category: true,
        date: true,
        venue: true,
        price: true,
        description: true,
      },
      orderBy: { date: 'asc' },
      take: 6,
    });

    return {
      status: "success" as const,
      data: upcomingEvents,
    };
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch upcoming events",
    };
  }
}

export async function getPaymentPendingEvents() {
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

    const pendingPayments = await prisma.participation.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['REGISTERED', 'PAYMENT_SUBMITTED'] },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
            venue: true,
            price: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    return {
      status: "success" as const,
      data: pendingPayments,
    };
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return {
      status: "error" as const,
      message: "Failed to fetch pending payments",
    };
  }
}