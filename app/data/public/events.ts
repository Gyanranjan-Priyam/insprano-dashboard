import "server-only";

import { prisma } from "@/lib/db";

export async function getPublicEventBySlugId(slugId: string) {
    try {
        const event = await prisma.event.findUnique({
            where: {
                slugId: slugId
            }
        });
        
        if (!event) {
            throw new Error('Event not found');
        }
        
        return event;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw new Error('Failed to fetch event');
    }
}

export async function getPublicEventById(id: string) {
    try {
        const event = await prisma.event.findUnique({
            where: {
                id: id
            }
        });
        
        if (!event) {
            throw new Error('Event not found');
        }
        
        return event;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw new Error('Failed to fetch event');
    }
}

export async function getAllPublicEvents() {
    try {
        const events = await prisma.event.findMany({
            orderBy: {
                date: 'asc' // Show upcoming events first
            }
        });
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
    }
}