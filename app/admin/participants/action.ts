"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

export async function getAllParticipants() {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const participants = await prisma.participation.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        slugId: true,
                        category: true,
                        price: true,
                        date: true,
                        venue: true,
                    }
                },
                teamLeader: {
                    select: {
                        id: true,
                        name: true,
                        slugId: true,
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
                                        registeredAt: true,
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                image: true,
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
                                id: true,
                                slugId: true,
                                leader: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        status: true,
                                        paymentSubmittedAt: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                registeredAt: 'desc'
            }
        });

        // Process participants to group team members under leaders
        const teamLeaderIds = new Set<string>();
        const processedParticipants = [];

        for (const participant of participants) {
            // Check if this person is a team member (not leader)
            const isTeamMember = participant.teamMember.length > 0;
            
            if (isTeamMember) {
                // Get the team leader ID for this team member
                const leaderId = participant.teamMember[0]?.team?.leader?.id;
                if (leaderId) {
                    teamLeaderIds.add(leaderId);
                    // Skip adding team members to main list - they'll be nested under leaders
                    continue;
                }
            }

            // This is either a team leader or an individual participant
            let paidByTeamLeader = null;
            
            // Check if this person's payment was covered by a team leader
            if (isTeamMember && participant.status === "CONFIRMED" && !participant.paymentSubmittedAt) {
                // This person was likely paid for by their team leader
                const teamLeader = participant.teamMember[0]?.team?.leader;
                if (teamLeader) {
                    paidByTeamLeader = {
                        id: teamLeader.id,
                        fullName: teamLeader.fullName,
                        email: teamLeader.email,
                        status: teamLeader.status,
                        paymentSubmittedAt: teamLeader.paymentSubmittedAt
                    };
                }
            }

            const participantData = {
                ...participant,
                teamMembers: [] as any[],
                isTeamLeader: participant.teamLeader.length > 0,
                teamSlugId: participant.teamLeader.length > 0 ? participant.teamLeader[0]?.slugId : 
                           (isTeamMember ? participant.teamMember[0]?.team?.slugId : null),
                paidByTeamLeader
            };

            // If this is a team leader, add their team members
            if (participant.teamLeader.length > 0) {
                const team = participant.teamLeader[0];
                participantData.teamMembers = team.members.map((member) => {
                    // Check if team member's payment was covered by the leader
                    let memberPaidByLeader = null;
                    if (member.participant.status === "CONFIRMED" && !member.participant.paymentSubmittedAt) {
                        memberPaidByLeader = {
                            id: participant.id,
                            fullName: participant.fullName,
                            email: participant.email,
                            status: participant.status,
                            paymentSubmittedAt: participant.paymentSubmittedAt
                        };
                    }

                    return {
                        ...member.participant,
                        joinedAt: member.joinedAt,
                        paidByTeamLeader: memberPaidByLeader
                    };
                });
            }

            processedParticipants.push(participantData);
        }

        return {
            status: "success",
            data: processedParticipants
        };
    } catch (error) {
        console.error("Failed to fetch participants:", error);
        return {
            status: "error",
            message: "Failed to fetch participants"
        };
    }
}

export async function getParticipantById(participationId: string) {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const participant = await prisma.participation.findUnique({
            where: {
                id: participationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        createdAt: true,
                    }
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        slugId: true,
                        category: true,
                        price: true,
                        date: true,
                        venue: true,
                        description: true,
                    }
                },
                teamLeader: {
                    include: {
                        members: {
                            include: {
                                participant: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        mobileNumber: true,
                                        collegeName: true,
                                        state: true,
                                        district: true,
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
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        mobileNumber: true,
                                        collegeName: true,
                                    }
                                },
                                members: {
                                    include: {
                                        participant: {
                                            select: {
                                                id: true,
                                                fullName: true,
                                                email: true,
                                                mobileNumber: true,
                                                collegeName: true,
                                                state: true,
                                                district: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!participant) {
            return {
                status: "error",
                message: "Participant not found"
            };
        }

        return {
            status: "success",
            data: participant
        };
    } catch (error) {
        console.error("Failed to fetch participant:", error);
        return {
            status: "error",
            message: "Failed to fetch participant details"
        };
    }
}

export async function updateParticipantStatus(participationId: string, status: string) {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const validStatuses = ['REGISTERED', 'PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return {
                status: "error",
                message: "Invalid status"
            };
        }

        await prisma.participation.update({
            where: {
                id: participationId
            },
            data: {
                status: status as any,
                ...(status === 'CONFIRMED' && { paymentVerifiedAt: new Date() })
            }
        });

        return {
            status: "success",
            message: "Participant status updated successfully"
        };
    } catch (error) {
        console.error("Failed to update participant status:", error);
        return {
            status: "error",
            message: "Failed to update participant status"
        };
    }
}