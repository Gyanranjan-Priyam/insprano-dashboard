import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { EventCategory } from "@prisma/client";

export async function getAllEvents() {
    await requireAdmin();
    
    try {
        const events = await prisma.event.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
    }
}

export async function getEventBySlugId(slugId: string) {
    await requireAdmin();
    
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

export async function updateEvent(slugId: string, data: {
    title?: string;
    description?: string;
    rules?: string;
    thumbnailKey?: string;
    pdfKey?: string;
    imageKeys?: string[];
    price?: number;
    venue?: string;
    date?: Date;
    category?: EventCategory;
}) {
    await requireAdmin();
    
    try {
        const event = await prisma.event.update({
            where: {
                slugId: slugId
            },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
        
        return event;
    } catch (error) {
        console.error('Error updating event:', error);
        throw new Error('Failed to update event');
    }
}