import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { ParticipationStatus } from "@prisma/client";

export async function getDashboardStats() {
    await requireAdmin();
    
    try {
        // Get total counts
        const [totalEvents, totalUsers, totalParticipations, totalTeams] = await Promise.all([
            prisma.event.count(),
            prisma.user.count(),
            prisma.participation.count(),
            prisma.team.count()
        ]);

        // Get participation status breakdown
        const participationStats = await prisma.participation.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRegistrations = await prisma.participation.count({
            where: {
                registeredAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        // Get revenue stats
        const confirmedParticipations = await prisma.participation.findMany({
            where: {
                status: ParticipationStatus.CONFIRMED
            },
            include: {
                event: {
                    select: {
                        price: true
                    }
                }
            }
        });

        const totalRevenue = confirmedParticipations.reduce((sum, participation) => {
            return sum + (participation.event.price || 0);
        }, 0);

        // Get pending payments
        const pendingPayments = await prisma.participation.count({
            where: {
                status: ParticipationStatus.PAYMENT_SUBMITTED
            }
        });

        return {
            totalEvents,
            totalUsers,
            totalParticipations,
            totalTeams,
            recentRegistrations,
            totalRevenue,
            pendingPayments,
            participationStats: participationStats.reduce((acc, stat) => {
                acc[stat.status] = stat._count.id;
                return acc;
            }, {} as Record<string, number>)
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard stats');
    }
}

export async function getRecentEvents(limit: number = 5) {
    await requireAdmin();
    
    try {
        const events = await prisma.event.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        participations: true
                    }
                }
            }
        });
        
        return events;
    } catch (error) {
        console.error('Error fetching recent events:', error);
        throw new Error('Failed to fetch recent events');
    }
}

export async function getRecentParticipations(limit: number = 10) {
    await requireAdmin();
    
    try {
        const participations = await prisma.participation.findMany({
            take: limit,
            orderBy: {
                registeredAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                },
                event: {
                    select: {
                        title: true,
                        slugId: true
                    }
                }
            }
        });
        
        return participations;
    } catch (error) {
        console.error('Error fetching recent participations:', error);
        throw new Error('Failed to fetch recent participations');
    }
}

export async function getEventStats() {
    await requireAdmin();
    
    try {
        // Get events with participation counts
        const events = await prisma.event.findMany({
            include: {
                _count: {
                    select: {
                        participations: true,
                        teams: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate event analytics
        const eventAnalytics = events.map(event => {
            const participationCount = event._count.participations;
            const teamCount = event._count.teams;
            const revenue = participationCount * event.price;
            
            return {
                id: event.id,
                title: event.title,
                slugId: event.slugId,
                category: event.category,
                date: event.date,
                price: event.price,
                participationCount,
                teamCount,
                revenue,
                createdAt: event.createdAt
            };
        });

        return eventAnalytics;
    } catch (error) {
        console.error('Error fetching event stats:', error);
        throw new Error('Failed to fetch event stats');
    }
}

export async function getMonthlyStats() {
    await requireAdmin();
    
    try {
        // Get monthly registration data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await prisma.participation.findMany({
            where: {
                registeredAt: {
                    gte: sixMonthsAgo
                }
            },
            include: {
                event: {
                    select: {
                        price: true
                    }
                }
            }
        });

        // Group by month
        const monthlyStats = monthlyData.reduce((acc, participation) => {
            const date = new Date(participation.registeredAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    month: monthKey,
                    registrations: 0,
                    revenue: 0
                };
            }
            
            acc[monthKey].registrations += 1;
            acc[monthKey].revenue += participation.event.price || 0;
            
            return acc;
        }, {} as Record<string, { month: string; registrations: number; revenue: number }>);

        return Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        throw new Error('Failed to fetch monthly stats');
    }
}