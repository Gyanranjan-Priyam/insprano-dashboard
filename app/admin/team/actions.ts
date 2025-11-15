"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

export async function getAllTeams(categoryFilter?: string) {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const teams = await prisma.team.findMany({
            where: categoryFilter ? {
                event: {
                    category: categoryFilter as any
                }
            } : {},
            include: {
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
                leader: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        mobileNumber: true,
                        status: true,
                        paymentAmount: true,
                        paymentSubmittedAt: true,
                        registeredAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            }
                        }
                    }
                },
                members: {
                    include: {
                        participant: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                status: true,
                                paymentAmount: true,
                                paymentSubmittedAt: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        joinedAt: 'asc'
                    }
                },
                joinRequests: {
                    where: {
                        status: 'PENDING'
                    },
                    include: {
                        participant: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            }
                        }
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        });

        return {
            status: "success",
            data: teams
        };
    } catch (error) {
        console.error("Failed to fetch teams:", error);
        return {
            status: "error",
            message: "Failed to fetch teams"
        };
    }
}

export async function getTeamStatistics() {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const [
            totalTeams,
            teamsWithMembers,
            totalMembers,
            pendingRequests
        ] = await Promise.all([
            prisma.team.count(),
            prisma.team.count({
                where: {
                    members: {
                        some: {}
                    }
                }
            }),
            prisma.teamMember.count(),
            prisma.teamJoinRequest.count({
                where: {
                    status: 'PENDING'
                }
            })
        ]);

        return {
            status: "success",
            data: {
                totalTeams,
                teamsWithMembers,
                totalMembers: totalMembers + totalTeams, // +totalTeams for team leaders
                pendingRequests
            }
        };
    } catch (error) {
        console.error("Failed to fetch team statistics:", error);
        return {
            status: "error",
            message: "Failed to fetch team statistics"
        };
    }
}

export async function getEventCategories() {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const categories = await prisma.event.findMany({
            select: {
                category: true
            },
            distinct: ['category']
        });

        return {
            status: "success",
            data: categories.map(c => c.category)
        };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return {
            status: "error",
            message: "Failed to fetch categories"
        };
    }
}