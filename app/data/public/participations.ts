import "server-only";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserParticipations() {
    try {
        // Get current user session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error('User not authenticated');
        }

        const participations = await prisma.participation.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                event: true
            },
            orderBy: {
                registeredAt: 'desc'
            }
        });

        return participations;
    } catch (error) {
        console.error('Error fetching user participations:', error);
        throw new Error('Failed to fetch participations');
    }
}

export async function getUserParticipationByEventId(eventId: string) {
    try {
        // Get current user session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return null;
        }

        const participation = await prisma.participation.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId: eventId
                }
            },
            include: {
                event: true
            }
        });

        return participation;
    } catch (error) {
        console.error('Error checking user participation:', error);
        return null;
    }
}

export async function registerForEvent(eventId: string) {
    try {
        // Get current user session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error('User not authenticated');
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            throw new Error('Event not found');
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
            throw new Error('User already registered for this event');
        }

        // Create participation record
        const participation = await prisma.participation.create({
            data: {
                userId: session.user.id,
                eventId: eventId,
                fullName: session.user.name || '',
                email: session.user.email || '',
                mobileNumber: '',
                aadhaarNumber: '',
                state: '',
                district: '',
                collegeName: '',
                collegeAddress: ''
            },
            include: {
                event: true
            }
        });

        return participation;
    } catch (error) {
        console.error('Error registering for event:', error);
        throw error;
    }
}