"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

export async function getTeamBySlugId(slugId: string) {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const team = await prisma.team.findUnique({
            where: { slugId },
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
                        description: true,
                    }
                },
                leader: {
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
                                createdAt: true,
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
                                        createdAt: true,
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
                    include: {
                        participant: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                mobileNumber: true,
                                whatsappNumber: true,
                                collegeName: true,
                                status: true,
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
                        requestedAt: 'desc'
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
        console.error("Failed to fetch team:", error);
        return {
            status: "error",
            message: "Failed to fetch team details"
        };
    }
}