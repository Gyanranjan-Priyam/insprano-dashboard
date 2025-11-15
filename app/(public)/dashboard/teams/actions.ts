"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { generateTeamSlug } from "@/lib/team-utils";
import { revalidatePath } from "next/cache";

interface CreateTeamData {
  name: string;
  eventId: string;
  description?: string;
  isPublic: boolean;
}

interface JoinTeamData {
  teamName: string;
  eventId: string;
}

export async function createTeam(data: CreateTeamData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to create a team"
      };
    }

    // Find the user's participation for this event
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: data.eventId
        }
      },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    });

    if (!participation) {
      return {
        status: "error",
        message: "You must be registered for this event to create a team"
      };
    }

    // Check if payment status is confirmed
    if (participation.status !== "CONFIRMED") {
      return {
        status: "error",
        message: "Your payment must be confirmed before you can create a team. Current status: " + participation.status.replace('_', ' ')
      };
    }

    // Check if team name already exists for this event
    const existingTeam = await prisma.team.findUnique({
      where: {
        name_eventId: {
          name: data.name,
          eventId: data.eventId
        }
      }
    });

    if (existingTeam) {
      return {
        status: "error",
        message: "A team with this name already exists for this event"
      };
    }

    // Check if participant is already in a team for this event
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        participantId: participation.id,
        team: {
          eventId: data.eventId
        }
      }
    });

    if (existingMembership) {
      return {
        status: "error",
        message: "You are already part of a team for this event"
      };
    }

    // Check if participant is already a team leader for this event
    const existingLeadership = await prisma.team.findFirst({
      where: {
        leaderId: participation.id,
        eventId: data.eventId
      }
    });

    if (existingLeadership) {
      return {
        status: "error",
        message: "You are already leading a team for this event"
      };
    }

    // Get event details to determine team size
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      select: { teamSize: true }
    });

    if (!event) {
      return {
        status: "error",
        message: "Event not found"
      };
    }

    // Generate unique team slug
    const teamSlug = generateTeamSlug(data.name, participation.event.title);

    // Create the team using event's teamSize
    const team = await prisma.team.create({
      data: {
        name: data.name,
        slugId: teamSlug,
        eventId: data.eventId,
        leaderId: participation.id,
        description: data.description,
        maxMembers: event.teamSize || 4, // Use event's teamSize
        isPublic: data.isPublic
      },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    });

    // Revalidate dashboard and teams pages to show updated data
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/teams");

    return {
      status: "success",
      message: "Team created successfully",
      data: team
    };
  } catch (error) {
    console.error("Failed to create team:", error);
    return {
      status: "error",
      message: "Failed to create team"
    };
  }
}

export async function joinTeam(data: JoinTeamData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to join a team"
      };
    }

    // Find the team first
    const team = await prisma.team.findUnique({
      where: {
        name_eventId: {
          name: data.teamName,
          eventId: data.eventId
        }
      },
      include: {
        members: true
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (!team.isPublic) {
      return {
        status: "error",
        message: "This team is private and requires an invitation"
      };
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return {
        status: "error",
        message: "Team is already full"
      };
    }

    // Find or create the user's participation for this event
    let participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: data.eventId
        }
      }
    });

    // If no participation exists, create one automatically
    if (!participation) {
      // Get user details for participation creation
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!user) {
        return {
          status: "error",
          message: "User not found"
        };
      }

      participation = await prisma.participation.create({
        data: {
          userId: session.user.id,
          eventId: data.eventId,
          status: "REGISTERED", // Start with registered status
          fullName: user.name || "",
          email: user.email || "",
          mobileNumber: user.mobileNumber || "",
          whatsappNumber: user.whatsappNumber || "",
          aadhaarNumber: user.aadhaarNumber || "",
          collegeName: user.collegeName || "",
          collegeAddress: user.collegeAddress || "",
          state: user.state || "",
          district: user.district || ""
        }
      });
    }

    // Check if participant is already in this team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participation.id
        }
      }
    });

    if (existingMembership) {
      return {
        status: "error",
        message: "You are already a member of this team"
      };
    }

    // Check if participant is already in another team for this event
    const otherMembership = await prisma.teamMember.findFirst({
      where: {
        participantId: participation.id,
        team: {
          eventId: data.eventId
        }
      }
    });

    if (otherMembership) {
      return {
        status: "error",
        message: "You are already part of another team for this event"
      };
    }

    // Check if participant is a team leader for this event
    const isLeader = await prisma.team.findFirst({
      where: {
        leaderId: participation.id,
        eventId: data.eventId
      }
    });

    if (isLeader) {
      return {
        status: "error",
        message: "You cannot join a team while leading another team"
      };
    }

    // Add member to team
    const membership = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        participantId: participation.id
      }
    });

    // Revalidate dashboard and teams pages to show updated data
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/teams");

    return {
      status: "success",
      message: "Successfully joined team",
      data: membership
    };
  } catch (error) {
    console.error("Failed to join team:", error);
    return {
      status: "error",
      message: "Failed to join team"
    };
  }
}

export async function leaveTeam(eventId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to leave a team"
      };
    }

    // Find the user's participation for this event
    const participation = await prisma.participation.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId
        }
      }
    });

    if (!participation) {
      return {
        status: "error",
        message: "Participation not found"
      };
    }

    // Check if participant is a team leader
    const isLeader = await prisma.team.findFirst({
      where: {
        leaderId: participation.id,
        eventId: eventId
      },
      include: {
        members: true
      }
    });

    if (isLeader) {
      if (isLeader.members.length > 0) {
        return {
          status: "error",
          message: "Cannot leave team while you have members. Transfer leadership or disband the team first."
        };
      }
      
      // Delete the team if no members
      await prisma.team.delete({
        where: {
          id: isLeader.id
        }
      });

      return {
        status: "success",
        message: "Team disbanded successfully"
      };
    }

    // Find and remove team membership
    const membership = await prisma.teamMember.findFirst({
      where: {
        participantId: participation.id,
        team: {
          eventId: eventId
        }
      }
    });

    if (!membership) {
      return {
        status: "error",
        message: "You are not part of any team for this event"
      };
    }

    await prisma.teamMember.delete({
      where: {
        id: membership.id
      }
    });

    return {
      status: "success",
      message: "Successfully left team"
    };
  } catch (error) {
    console.error("Failed to leave team:", error);
    return {
      status: "error",
      message: "Failed to leave team"
    };
  }
}

export async function getUserTeams() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to view teams"
      };
    }

    // Get user's participations first
    const participations = await prisma.participation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true
          }
        }
      }
    });

    // Get user's participation IDs
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
            leader: {
              select: {
                fullName: true,
                email: true
              }
            },
            members: {
              include: {
                participant: {
                  select: {
                    fullName: true,
                    email: true,
                    collegeName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get team leaderships using participation IDs
    const teamLeaderships = await prisma.team.findMany({
      where: { 
        leaderId: {
          in: userParticipationIds
        }
      },
      include: {
        members: {
          include: {
            participant: {
              select: {
                fullName: true,
                email: true,
                collegeName: true
              }
            }
          }
        }
      }
    });

    // Transform the data to match the expected format for the teams page
    const transformedParticipations = participations.map(participation => {
      // Find teams where this participation is a leader
      const teamLeader = teamLeaderships.filter(team => team.leaderId === participation.id).map(team => ({
        id: team.id,
        name: team.name,
        slugId: team.slugId,
        description: team.description,
        maxMembers: team.maxMembers,
        isPublic: team.isPublic,
        createdAt: team.createdAt,
        members: team.members
      }));

      // Find teams where this participation is a member (but not a leader)
      const teamMember = teamMemberships
        .filter(membership => {
          // Only include if this participant is a member AND not the leader of this team
          return membership.participantId === participation.id && 
                 membership.team.leaderId !== participation.id;
        })
        .map(membership => ({
          id: membership.id,
          team: {
            id: membership.team.id,
            name: membership.team.name,
            slugId: membership.team.slugId,
            description: membership.team.description,
            maxMembers: membership.team.maxMembers,
            isPublic: membership.team.isPublic,
            createdAt: membership.team.createdAt,
            leader: membership.team.leader,
            members: membership.team.members
          }
        }));

      return {
        ...participation,
        teamLeader,
        teamMember
      };
    });

    console.log('Debug: getUserTeams - Team memberships found:', teamMemberships.length);
    console.log('Debug: getUserTeams - Team leaderships found:', teamLeaderships.length);
    console.log('Debug: getUserTeams - Transformed participations:', transformedParticipations.length);

    // Debug: Check for any cases where a user is both leader and member of the same team
    participations.forEach(participation => {
      const leaderTeamIds = teamLeaderships
        .filter(team => team.leaderId === participation.id)
        .map(team => team.id);
      
      const memberTeamIds = teamMemberships
        .filter(membership => membership.participantId === participation.id)
        .map(membership => membership.team.id);
      
      const duplicateTeamIds = leaderTeamIds.filter(id => memberTeamIds.includes(id));
      
      if (duplicateTeamIds.length > 0) {
        console.warn(`Warning: Participation ${participation.id} is both leader and member of team(s):`, duplicateTeamIds);
      }
    });

    return {
      status: "success",
      data: transformedParticipations
    };
  } catch (error) {
    console.error("Failed to get user teams:", error);
    return {
      status: "error",
      message: "Failed to get user teams"
    };
  }
}

export async function getAvailableTeams(eventId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to view teams"
      };
    }

    const teams = await prisma.team.findMany({
      where: {
        isPublic: true,
        ...(eventId && { eventId: eventId })
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true
          }
        },
        leader: {
          select: {
            fullName: true,
            collegeName: true
          }
        },
        members: {
          include: {
            participant: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      status: "success",
      data: teams
    };
  } catch (error) {
    console.error("Failed to get available teams:", error);
    return {
      status: "error",
      message: "Failed to get available teams"
    };
  }
}

export async function getTeamBySlug(slugId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to view team details"
      };
    }

    const team = await prisma.team.findUnique({
      where: {
        slugId: slugId
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
            venue: true,
            description: true
          }
        },
        leader: {
          select: {
            id: true,
            fullName: true,
            email: true,
            collegeName: true,
            mobileNumber: true,
            state: true,
            district: true
          }
        },
        members: {
          include: {
            participant: {
              select: {
                id: true,
                fullName: true,
                email: true,
                collegeName: true,
                mobileNumber: true,
                state: true,
                district: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    return {
      status: "success",
      data: team
    };
  } catch (error) {
    console.error("Failed to get team by slug:", error);
    return {
      status: "error",
      message: "Failed to get team details"
    };
  }
}

export async function getUserEvents() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to view events"
      };
    }

    const participations = await prisma.participation.findMany({
      where: {
        userId: session.user.id,
        status: "CONFIRMED" // Only show events with confirmed payments
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
            venue: true,
            teamSize: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    return {
      status: "success",
      data: participations.map(p => p.event)
    };
  } catch (error) {
    console.error("Failed to get user events:", error);
    return {
      status: "error",
      message: "Failed to get user events"
    };
  }
}

export async function updateTeam(slugId: string, data: {
  name?: string;
  description?: string;
  isPublic?: boolean;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to update a team"
      };
    }

    // Find the team and verify leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true
          }
        },
        members: true
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can update team information"
      };
    }

    // Check if team name already exists (if changing name)
    if (data.name && data.name !== team.name) {
      const existingTeam = await prisma.team.findUnique({
        where: {
          name_eventId: {
            name: data.name,
            eventId: team.eventId
          }
        }
      });

      if (existingTeam) {
        return {
          status: "error",
          message: "A team with this name already exists for this event"
        };
      }
    }

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { slugId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic })
      },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    });

    return {
      status: "success",
      message: "Team updated successfully",
      data: updatedTeam
    };
  } catch (error) {
    console.error("Failed to update team:", error);
    return {
      status: "error",
      message: "Failed to update team"
    };
  }
}

export async function addTeamMember(slugId: string, participantEmail: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to add team members"
      };
    }

    // Find the team and verify leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true
          }
        },
        members: true
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can add members"
      };
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return {
        status: "error",
        message: "Team is already at maximum capacity"
      };
    }

    // Find the participant by email
    const participant = await prisma.participation.findFirst({
      where: {
        email: participantEmail,
        eventId: team.eventId,
        status: "CONFIRMED"
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Participant not found or payment not confirmed for this event"
      };
    }

    // Check if participant is already in this team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participant.id
        }
      }
    });

    if (existingMembership) {
      return {
        status: "error",
        message: "This participant is already a member of this team"
      };
    }

    // Check if participant is already in another team for this event
    const otherMembership = await prisma.teamMember.findFirst({
      where: {
        participantId: participant.id,
        team: {
          eventId: team.eventId
        }
      }
    });

    if (otherMembership) {
      return {
        status: "error",
        message: "This participant is already part of another team for this event"
      };
    }

    // Check if participant is a team leader for this event
    const isLeader = await prisma.team.findFirst({
      where: {
        leaderId: participant.id,
        eventId: team.eventId
      }
    });

    if (isLeader) {
      return {
        status: "error",
        message: "This participant is already leading another team for this event"
      };
    }

    // Add member to team
    const membership = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        participantId: participant.id
      }
    });

    return {
      status: "success",
      message: `${participant.user.name || participant.fullName} has been added to the team`,
      data: membership
    };
  } catch (error) {
    console.error("Failed to add team member:", error);
    return {
      status: "error",
      message: "Failed to add team member"
    };
  }
}

export async function removeTeamMember(slugId: string, participantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to remove team members"
      };
    }

    // Find the team and verify leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can remove members"
      };
    }

    // Find the membership and related participation
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        participantId: participantId
      },
      include: {
        participant: {
          select: {
            id: true,
            fullName: true,
            userId: true,
            eventId: true
          }
        }
      }
    });

    if (!membership) {
      return {
        status: "error",
        message: "Member not found in this team"
      };
    }

    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      console.log(`Removing member ${membership.participant.fullName} from team ${team.name}`);
      
      // 1. Delete the team membership
      await tx.teamMember.delete({
        where: {
          id: membership.id
        }
      });
      console.log(`✓ Deleted team membership for ${membership.participant.fullName}`);

      // 2. Delete the participation record (removes payment status and event registration)
      await tx.participation.delete({
        where: {
          id: participantId
        }
      });
      console.log(`✓ Deleted participation record for ${membership.participant.fullName}`);

      // 3. Check if the user has any other participations
      const otherParticipations = await tx.participation.findMany({
        where: {
          userId: membership.participant.userId,
          id: {
            not: participantId // Exclude the one we just deleted
          }
        }
      });

      // 4. If the user has no other participations, delete the user account
      if (otherParticipations.length === 0) {
        // First check if user has any other relationships that would prevent deletion
        const userSessions = await tx.session.findMany({
          where: { userId: membership.participant.userId }
        });
        
        const userAccounts = await tx.account.findMany({
          where: { userId: membership.participant.userId }
        });

        // Delete sessions and accounts first
        if (userSessions.length > 0) {
          await tx.session.deleteMany({
            where: { userId: membership.participant.userId }
          });
          console.log(`✓ Deleted ${userSessions.length} sessions for user`);
        }

        if (userAccounts.length > 0) {
          await tx.account.deleteMany({
            where: { userId: membership.participant.userId }
          });
          console.log(`✓ Deleted ${userAccounts.length} accounts for user`);
        }

        // Finally delete the user
        await tx.user.delete({
          where: {
            id: membership.participant.userId
          }
        });
        console.log(`✓ Deleted user account for ${membership.participant.fullName} (no other participations found)`);
      } else {
        console.log(`✓ Preserved user account for ${membership.participant.fullName} (has ${otherParticipations.length} other participations)`);
      }
    });

    revalidatePath(`/dashboard/teams/${slugId}`);
    revalidatePath('/dashboard/teams');

    return {
      status: "success",
      message: `${membership.participant.fullName} has been completely removed from the team and event`
    };
  } catch (error) {
    console.error("Failed to remove team member:", error);
    return {
      status: "error",
      message: "Failed to remove team member"
    };
  }
}

export async function transferTeamLeadership(slugId: string, newLeaderParticipantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to transfer leadership"
      };
    }

    // Find the team and verify current leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true,
            fullName: true
          }
        },
        members: {
          include: {
            participant: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only current team leader can transfer leadership"
      };
    }

    // Check if new leader is a member of the team
    const newLeaderMembership = team.members.find(
      member => member.participant.id === newLeaderParticipantId
    );

    if (!newLeaderMembership) {
      return {
        status: "error",
        message: "New leader must be a member of the team"
      };
    }

    // Transfer leadership
    await prisma.$transaction(async (tx) => {
      // Remove new leader from members
      await tx.teamMember.delete({
        where: {
          id: newLeaderMembership.id
        }
      });

      // Add current leader as member
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          participantId: team.leaderId
        }
      });

      // Update team leader
      await tx.team.update({
        where: { id: team.id },
        data: {
          leaderId: newLeaderParticipantId
        }
      });
    });

    return {
      status: "success",
      message: `Leadership transferred to ${newLeaderMembership.participant.fullName}`
    };
  } catch (error) {
    console.error("Failed to transfer leadership:", error);
    return {
      status: "error",
      message: "Failed to transfer leadership"
    };
  }
}

export async function deleteTeam(slugId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to delete a team"
      };
    }

    // Find the team and verify leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true,
            fullName: true
          }
        },
        members: true,
        joinRequests: true,
        event: {
          select: {
            title: true
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can delete the team"
      };
    }

    // Delete the team and all related data using transaction
    await prisma.$transaction(async (tx) => {
      // Delete all team join requests
      await tx.teamJoinRequest.deleteMany({
        where: {
          teamId: team.id
        }
      });

      // Delete all team members
      await tx.teamMember.deleteMany({
        where: {
          teamId: team.id
        }
      });

      // Delete the team itself
      await tx.team.delete({
        where: {
          id: team.id
        }
      });
    });

    // Revalidate dashboard and teams pages to show updated data
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/teams");

    return {
      status: "success",
      message: `Team "${team.name}" has been successfully deleted`
    };
  } catch (error) {
    console.error("Failed to delete team:", error);
    return {
      status: "error",
      message: "Failed to delete team"
    };
  }
}

export async function addTeamMemberWithProfile(slugId: string, memberData: {
  fullName: string;
  email: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  aadhaarNumber?: string;
  collegeName?: string;
  collegeAddress?: string;
  state?: string;
  district?: string;
  pinCode?: string;
  profileImageKey?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to add team members"
      };
    }

    // Find the team and verify leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true
          }
        },
        members: true
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can add members"
      };
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return {
        status: "error",
        message: "Team is already at maximum capacity"
      };
    }

    // Check if a participation exists for this email and event
    let participant = await prisma.participation.findFirst({
      where: {
        email: memberData.email,
        eventId: team.eventId
      }
    });

    // If no participation exists, we need to create one
    if (!participant) {
      // Use a transaction to ensure data consistency
      participant = await prisma.$transaction(async (tx) => {
        // Check if user exists with this email
        let user = await tx.user.findUnique({
          where: { email: memberData.email }
        });

        if (!user) {
          // Create a new user record with a unique ID
          const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          user = await tx.user.create({
            data: {
              id: uniqueId,
              name: memberData.fullName,
              email: memberData.email,
              emailVerified: false
            }
          });
        }

        // Create the participation record with the proper user ID
        return await tx.participation.create({
          data: {
            userId: user.id,
            eventId: team.eventId,
            fullName: memberData.fullName,
            email: memberData.email,
            mobileNumber: memberData.mobileNumber || "",
            whatsappNumber: memberData.whatsappNumber || "",
            aadhaarNumber: memberData.aadhaarNumber || "",
            collegeName: memberData.collegeName || "",
            collegeAddress: memberData.collegeAddress || "",
            state: memberData.state || "",
            district: memberData.district || "",
            status: "CONFIRMED" // Automatically confirm for team addition
          }
        });
      });
    }

    // Check if participant is already in this team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participant.id
        }
      }
    });

    if (existingMembership) {
      return {
        status: "error",
        message: "This participant is already a member of this team"
      };
    }

    // Check if participant is already in another team for this event
    const otherMembership = await prisma.teamMember.findFirst({
      where: {
        participantId: participant.id,
        team: {
          eventId: team.eventId
        }
      }
    });

    if (otherMembership) {
      return {
        status: "error",
        message: "This participant is already part of another team for this event"
      };
    }

    // Check if participant is a team leader for this event
    const isLeader = await prisma.team.findFirst({
      where: {
        leaderId: participant.id,
        eventId: team.eventId
      }
    });

    if (isLeader) {
      return {
        status: "error",
        message: "This participant is already leading another team for this event"
      };
    }

    // Add member to team with profile information
    const membership = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        participantId: participant.id,
        fullName: memberData.fullName,
        email: memberData.email,
        mobileNumber: memberData.mobileNumber,
        whatsappNumber: memberData.whatsappNumber,
        aadhaarNumber: memberData.aadhaarNumber,
        collegeName: memberData.collegeName,
        collegeAddress: memberData.collegeAddress,
        state: memberData.state,
        district: memberData.district,
        pinCode: memberData.pinCode,
        profileImageKey: memberData.profileImageKey
      }
    });

    return {
      status: "success",
      message: `${memberData.fullName} has been added to the team`,
      data: membership
    };
  } catch (error) {
    console.error("Failed to add team member with profile:", error);
    return {
      status: "error",
      message: "Failed to add team member"
    };
  }
}

function generateTeamCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function generateNewTeamCode(slugId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to generate a team code"
      };
    }

    // Find the team and verify leadership
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can generate team codes"
      };
    }

    // Generate a unique team code
    let newTeamCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      newTeamCode = generateTeamCode();
      const existingTeam = await prisma.team.findUnique({
        where: { teamCode: newTeamCode }
      });
      isUnique = !existingTeam;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return {
        status: "error",
        message: "Failed to generate unique team code. Please try again."
      };
    }

    // Update the team with the new code
    const updatedTeam = await prisma.team.update({
      where: { slugId },
      data: { teamCode: newTeamCode }
    });

    return {
      status: "success",
      message: "Team code generated successfully",
      data: { teamCode: newTeamCode }
    };
  } catch (error) {
    console.error("Failed to generate team code:", error);
    return {
      status: "error",
      message: "Failed to generate team code"
    };
  }
}

export async function joinTeamByCode(teamCode: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to join a team"
      };
    }

    // Find the team by code
    const team = await prisma.team.findUnique({
      where: { teamCode },
      include: {
        event: {
          select: {
            id: true,
            title: true
          }
        },
        members: true,
        leader: {
          select: {
            userId: true,
            status: true,
            paymentAmount: true
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Invalid team code"
      };
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return {
        status: "error",
        message: "Team is already at maximum capacity"
      };
    }

    // Check if user is the team leader
    if (team.leader.userId === session.user.id) {
      return {
        status: "error",
        message: "You are already the leader of this team"
      };
    }

    // Find or create user's participation for this event
    let participation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        eventId: team.event.id
      }
    });

    // If user is not registered, create a participation record automatically
    if (!participation) {
      // Get user details for participation creation
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!user) {
        return {
          status: "error",
          message: "User not found"
        };
      }

      participation = await prisma.participation.create({
        data: {
          userId: session.user.id,
          eventId: team.event.id,
          status: "REGISTERED", // Start with registered status
          fullName: user.name || "",
          email: user.email || "",
          mobileNumber: user.mobileNumber || "",
          whatsappNumber: user.whatsappNumber || "",
          aadhaarNumber: user.aadhaarNumber || "",
          collegeName: user.collegeName || "",
          collegeAddress: user.collegeAddress || "",
          state: user.state || "",
          district: user.district || ""
        }
      });
    }

    // Check if user is already in this team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participation.id
        }
      }
    });

    if (existingMembership) {
      return {
        status: "error",
        message: "You are already a member of this team"
      };
    }

    // Check if user is already in another team for this event
    const otherMembership = await prisma.teamMember.findFirst({
      where: {
        participantId: participation.id,
        team: {
          eventId: team.event.id
        }
      }
    });

    if (otherMembership) {
      return {
        status: "error",
        message: "You are already part of another team for this event"
      };
    }

    // Check if user is leading another team for this event
    const leadingTeam = await prisma.team.findFirst({
      where: {
        leaderId: participation.id,
        eventId: team.event.id
      }
    });

    if (leadingTeam) {
      return {
        status: "error",
        message: "You are already leading another team for this event"
      };
    }

    // Add user to team
    await prisma.$transaction([
      // Create team membership
      prisma.teamMember.create({
        data: {
          teamId: team.id,
          participantId: participation.id
        }
      }),
      // If team leader has confirmed payment, auto-confirm this member's payment
      ...(team.leader.status === "CONFIRMED" ? [
        prisma.participation.update({
          where: { id: participation.id },
          data: {
            status: "CONFIRMED",
            paymentVerifiedAt: new Date(),
            paymentAmount: team.leader.paymentAmount || 0
          }
        })
      ] : [])
    ]);

    // Revalidate dashboard and teams pages to show updated data
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/teams");

    return {
      status: "success",
      message: `Successfully joined team "${team.name}" for ${team.event.title}`,
      data: { team: { name: team.name, slugId: team.slugId } }
    };
  } catch (error) {
    console.error("Failed to join team by code:", error);
    return {
      status: "error",
      message: "Failed to join team"
    };
  }
}

// Team Join Request Actions
export async function createJoinRequest(data: {
  teamId: string;
  teamCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  message?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to join a team"
      };
    }

    // Verify team exists and get event info
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      include: {
        event: true,
        members: true,
        joinRequests: {
          where: { status: "PENDING" }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return {
        status: "error",
        message: "Team is already at maximum capacity"
      };
    }

    // Find or create user's participation for this event
    let participation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        eventId: team.eventId
      }
    });

    // If user is not registered for the event, create a participation record automatically
    if (!participation) {
      participation = await prisma.participation.create({
        data: {
          userId: session.user.id,
          eventId: team.eventId,
          status: "REGISTERED", // Start with registered status
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          whatsappNumber: data.whatsappNumber,
          aadhaarNumber: data.aadhaarNumber,
          state: data.state,
          district: data.district,
          collegeName: data.collegeName,
          collegeAddress: data.collegeAddress
        }
      });
    }

    // Check if user is already in this team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participation.id
        }
      }
    });

    if (existingMembership) {
      return {
        status: "error",
        message: "You are already a member of this team"
      };
    }

    // Check if user already has a pending request for this team
    const existingRequest = await prisma.teamJoinRequest.findUnique({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participation.id
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return {
          status: "error",
          message: "You already have a pending join request for this team"
        };
      } else if (existingRequest.status === "REJECTED") {
        return {
          status: "error",
          message: "Your previous join request was rejected. Please contact the team leader."
        };
      }
    }

    // Check if user is already in another team for this event
    const otherMembership = await prisma.teamMember.findFirst({
      where: {
        participantId: participation.id,
        team: {
          eventId: team.eventId
        }
      }
    });

    if (otherMembership) {
      return {
        status: "error",
        message: "You are already part of another team for this event"
      };
    }

    // Check if user is leading another team for this event
    const leadingTeam = await prisma.team.findFirst({
      where: {
        leaderId: participation.id,
        eventId: team.eventId
      }
    });

    if (leadingTeam) {
      return {
        status: "error",
        message: "You are already leading another team for this event"
      };
    }

    // Create or update the join request
    const joinRequest = await prisma.teamJoinRequest.upsert({
      where: {
        teamId_participantId: {
          teamId: team.id,
          participantId: participation.id
        }
      },
      create: {
        teamId: team.id,
        participantId: participation.id,
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        whatsappNumber: data.whatsappNumber,
        aadhaarNumber: data.aadhaarNumber,
        state: data.state,
        district: data.district,
        collegeName: data.collegeName,
        collegeAddress: data.collegeAddress,
        message: data.message,
        status: "PENDING"
      },
      update: {
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        whatsappNumber: data.whatsappNumber,
        aadhaarNumber: data.aadhaarNumber,
        state: data.state,
        district: data.district,
        collegeName: data.collegeName,
        collegeAddress: data.collegeAddress,
        message: data.message,
        status: "PENDING",
        requestedAt: new Date(),
        respondedAt: null,
        respondedBy: null
      }
    });

    return {
      status: "success",
      message: `Join request sent to team "${team.name}". The team leader will review your application.`,
      data: joinRequest
    };

  } catch (error) {
    console.error("Failed to create join request:", error);
    return {
      status: "error",
      message: "Failed to submit join request"
    };
  }
}

export async function getTeamJoinRequests(slugId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required"
      };
    }

    // Get team and verify user is the leader
    const team = await prisma.team.findUnique({
      where: { slugId },
      include: {
        leader: true,
        joinRequests: {
          where: { status: "PENDING" },
          include: {
            participant: {
              include: {
                user: true
              }
            }
          },
          orderBy: { requestedAt: "desc" }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    if (team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can view join requests"
      };
    }

    return {
      status: "success",
      data: team.joinRequests
    };

  } catch (error) {
    console.error("Failed to get join requests:", error);
    return {
      status: "error",
      message: "Failed to fetch join requests"
    };
  }
}

export async function respondToJoinRequest(requestId: string, action: "APPROVED" | "REJECTED") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required"
      };
    }

    // Get the join request with team info
    const joinRequest = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          include: {
            leader: true,
            members: true
          }
        },
        participant: {
          include: {
            user: true
          }
        }
      }
    });

    if (!joinRequest) {
      return {
        status: "error",
        message: "Join request not found"
      };
    }

    // Verify user is the team leader
    if (joinRequest.team.leader.userId !== session.user.id) {
      return {
        status: "error",
        message: "Only team leaders can respond to join requests"
      };
    }

    // Check if request is still pending
    if (joinRequest.status !== "PENDING") {
      return {
        status: "error",
        message: "This request has already been processed"
      };
    }

    if (action === "APPROVED") {
      // Check if team still has space
      if (joinRequest.team.members.length >= joinRequest.team.maxMembers) {
        return {
          status: "error",
          message: "Team is now at maximum capacity"
        };
      }

      // Check if user is still available (not in another team)
      const existingMembership = await prisma.teamMember.findFirst({
        where: {
          participantId: joinRequest.participantId,
          team: {
            eventId: joinRequest.team.eventId
          }
        }
      });

      if (existingMembership) {
        // Update request to rejected since user is no longer available
        await prisma.teamJoinRequest.update({
          where: { id: requestId },
          data: {
            status: "REJECTED",
            respondedAt: new Date(),
            respondedBy: session.user.id
          }
        });

        return {
          status: "error",
          message: "User has already joined another team for this event"
        };
      }

      // Check if team leader has confirmed payment
      const teamLeaderConfirmed = joinRequest.team.leader.status === "CONFIRMED";

      // Approve the request and add member to team
      await prisma.$transaction([
        // Update the join request
        prisma.teamJoinRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            respondedAt: new Date(),
            respondedBy: session.user.id
          }
        }),
        // Add member to team
        prisma.teamMember.create({
          data: {
            teamId: joinRequest.teamId,
            participantId: joinRequest.participantId,
            fullName: joinRequest.fullName,
            email: joinRequest.email,
            mobileNumber: joinRequest.mobileNumber,
            whatsappNumber: joinRequest.whatsappNumber,
            aadhaarNumber: joinRequest.aadhaarNumber,
            state: joinRequest.state,
            district: joinRequest.district,
            collegeName: joinRequest.collegeName,
            collegeAddress: joinRequest.collegeAddress
          }
        }),
        // If team leader has confirmed payment, auto-confirm this member's payment
        ...(teamLeaderConfirmed ? [
          prisma.participation.update({
            where: { id: joinRequest.participantId },
            data: {
              status: "CONFIRMED",
              paymentVerifiedAt: new Date(),
              paymentAmount: joinRequest.team.leader.paymentAmount || 0
            }
          })
        ] : [])
      ]);

      return {
        status: "success",
        message: `${joinRequest.fullName} has been added to the team`
      };

    } else {
      // Reject the request
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          respondedAt: new Date(),
          respondedBy: session.user.id
        }
      });

      return {
        status: "success",
        message: `Join request from ${joinRequest.fullName} has been rejected`
      };
    }

  } catch (error) {
    console.error("Failed to respond to join request:", error);
    return {
      status: "error",
      message: "Failed to process join request"
    };
  }
}

export async function getTeamInfoByCode(teamCode: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "Authentication required"
      };
    }

    const team = await prisma.team.findUnique({
      where: { teamCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true
          }
        },
        leader: {
          select: {
            fullName: true,
            email: true
          }
        },
        members: {
          select: {
            id: true
          }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Invalid team code"
      };
    }

    return {
      status: "success",
      data: {
        id: team.id,
        name: team.name,
        description: team.description,
        teamCode: team.teamCode,
        maxMembers: team.maxMembers,
        currentMembers: team.members.length,
        event: team.event,
        leader: team.leader
      }
    };

  } catch (error) {
    console.error("Failed to get team info:", error);
    return {
      status: "error",
      message: "Failed to fetch team information"
    };
  }
}

export async function syncUserProfileFromTeamMemberData(userEmail: string, userId: string) {
  try {
    // Find all team member records with detailed profile information for this email
    const teamMemberRecords = await prisma.teamMember.findMany({
      where: {
        email: userEmail,
        // Only get records that have profile information
        OR: [
          { fullName: { not: null } },
          { mobileNumber: { not: null } },
          { whatsappNumber: { not: null } },
          { aadhaarNumber: { not: null } },
          { collegeName: { not: null } },
          { collegeAddress: { not: null } },
          { state: { not: null } },
          { district: { not: null } },
          { pinCode: { not: null } },
          { profileImageKey: { not: null } }
        ]
      },
      orderBy: {
        joinedAt: 'desc' // Get the most recent record
      }
    });

    if (teamMemberRecords.length === 0) {
      return {
        status: "info",
        message: "No team member profile data found to sync"
      };
    }

    // Get the most recent team member record with profile data
    const latestMemberRecord = teamMemberRecords[0];

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return {
        status: "error",
        message: "User not found"
      };
    }

    // Prepare update data - only update fields that are empty in user profile but have data in team member record
    const updateData: any = {};

    if (!currentUser.name && latestMemberRecord.fullName) {
      updateData.name = latestMemberRecord.fullName;
    }
    if (!currentUser.mobileNumber && latestMemberRecord.mobileNumber) {
      updateData.mobileNumber = latestMemberRecord.mobileNumber;
    }
    if (!currentUser.whatsappNumber && latestMemberRecord.whatsappNumber) {
      updateData.whatsappNumber = latestMemberRecord.whatsappNumber;
    }
    if (!currentUser.aadhaarNumber && latestMemberRecord.aadhaarNumber) {
      updateData.aadhaarNumber = latestMemberRecord.aadhaarNumber;
    }
    if (!currentUser.collegeName && latestMemberRecord.collegeName) {
      updateData.collegeName = latestMemberRecord.collegeName;
    }
    if (!currentUser.collegeAddress && latestMemberRecord.collegeAddress) {
      updateData.collegeAddress = latestMemberRecord.collegeAddress;
    }
    if (!currentUser.state && latestMemberRecord.state) {
      updateData.state = latestMemberRecord.state;
    }
    if (!currentUser.district && latestMemberRecord.district) {
      updateData.district = latestMemberRecord.district;
    }
    if (!currentUser.profileImageKey && latestMemberRecord.profileImageKey) {
      updateData.profileImageKey = latestMemberRecord.profileImageKey;
    }

    // If there's data to update, update the user profile
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Also update related participation records if they exist
      await prisma.participation.updateMany({
        where: {
          userId: userId,
          email: userEmail
        },
        data: {
          ...(latestMemberRecord.fullName && { fullName: latestMemberRecord.fullName }),
          ...(latestMemberRecord.mobileNumber && { mobileNumber: latestMemberRecord.mobileNumber }),
          ...(latestMemberRecord.whatsappNumber && { whatsappNumber: latestMemberRecord.whatsappNumber }),
          ...(latestMemberRecord.aadhaarNumber && { aadhaarNumber: latestMemberRecord.aadhaarNumber }),
          ...(latestMemberRecord.collegeName && { collegeName: latestMemberRecord.collegeName }),
          ...(latestMemberRecord.collegeAddress && { collegeAddress: latestMemberRecord.collegeAddress }),
          ...(latestMemberRecord.state && { state: latestMemberRecord.state }),
          ...(latestMemberRecord.district && { district: latestMemberRecord.district })
        }
      });

      return {
        status: "success",
        message: "Profile updated with team member information",
        updatedFields: Object.keys(updateData)
      };
    } else {
      return {
        status: "info",
        message: "No new information to sync - profile already complete"
      };
    }

  } catch (error) {
    console.error("Failed to sync user profile from team member data:", error);
    return {
      status: "error",
      message: "Failed to sync profile data"
    };
  }
}

// Create join request using team code
export async function createJoinRequestByCode(data: {
  teamCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  message?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        status: "error",
        message: "You must be logged in to join a team"
      };
    }

    // First find the team by code
    const team = await prisma.team.findUnique({
      where: { teamCode: data.teamCode.toUpperCase() },
      include: {
        event: true,
        members: {
          where: { isActive: true },
          include: {
            participant: {
              select: { userId: true }
            }
          }
        },
        leader: {
          select: { userId: true }
        }
      }
    });

    if (!team) {
      return {
        status: "error",
        message: "Team not found"
      };
    }

    // Check if user is already the leader
    if (team.leader.userId === session.user.id) {
      return {
        status: "error",
        message: "You are already the leader of this team"
      };
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(member => 
      member.participant.userId === session.user.id
    );

    if (isAlreadyMember) {
      return {
        status: "error",
        message: "You are already a member of this team"
      };
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers - 1) { // -1 because leader counts as one
      return {
        status: "error",
        message: "This team is already full"
      };
    }

    // Find or create user's participation for this event
    let userParticipation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        eventId: team.eventId
      }
    });

    // If user is not registered for the event, create a participation record automatically
    if (!userParticipation) {
      userParticipation = await prisma.participation.create({
        data: {
          userId: session.user.id,
          eventId: team.eventId,
          status: "REGISTERED", // Start with registered status
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          whatsappNumber: data.whatsappNumber,
          aadhaarNumber: data.aadhaarNumber,
          state: data.state,
          district: data.district,
          collegeName: data.collegeName,
          collegeAddress: data.collegeAddress
        }
      });
    }

    // Create the join request
    await prisma.teamJoinRequest.create({
      data: {
        teamId: team.id,
        participantId: userParticipation.id,
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        whatsappNumber: data.whatsappNumber,
        aadhaarNumber: data.aadhaarNumber,
        state: data.state,
        district: data.district,
        collegeName: data.collegeName,
        collegeAddress: data.collegeAddress,
        message: data.message,
      }
    });

    return {
      status: "success",
      message: "Join request sent successfully! The team leader will review your request."
    };

  } catch (error) {
    console.error("Failed to create join request:", error);
    return {
      status: "error",
      message: "Failed to send join request"
    };
  }
}