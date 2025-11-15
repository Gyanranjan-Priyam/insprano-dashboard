"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { eventSchema, EventSchemaType } from "@/lib/zodSchema";

export async function getEventBySlugId(slugId: string) {
    try {
        // Ensure only admin can access
        await requireAdmin();

        const event = await prisma.event.findUnique({
            where: {
                slugId: slugId
            }
        });

        if (!event) {
            throw new Error('Event not found');
        }

        return {
            status: "success",
            data: event
        };
    } catch (error) {
        console.error("Failed to fetch event:", error);
        return {
            status: "error",
            message: "Failed to fetch event"
        };
    }
}

export async function updateEventAction(slugId: string, values: EventSchemaType): Promise<ApiResponse> {
    try {
        // Ensure only admin can update events
        await requireAdmin();

        const validation = eventSchema.safeParse(values);

        if (!validation.success) {
            return {
                status: "error",
                message: "Invalid form data"
            };
        }

        // Check if the event exists
        const existingEvent = await prisma.event.findUnique({
            where: {
                slugId: slugId
            }
        });

        if (!existingEvent) {
            return {
                status: "error",
                message: "Event not found"
            };
        }

        // If slug is changing, check if new slug already exists
        if (validation.data.slugId !== slugId) {
            const slugExists = await prisma.event.findUnique({
                where: {
                    slugId: validation.data.slugId
                }
            });

            if (slugExists) {
                return {
                    status: "error",
                    message: "An event with this slug ID already exists"
                };
            }
        }

        await prisma.event.update({
            where: {
                slugId: slugId
            },
            data: {
                title: validation.data.title,
                slugId: validation.data.slugId,
                description: validation.data.description,
                rules: validation.data.rules,
                thumbnailKey: validation.data.thumbnailKey,
                pdfKey: validation.data.pdfKey,
                imageKeys: validation.data.imageKeys,
                priceType: validation.data.priceType,
                price: validation.data.price,
                venue: validation.data.venue,
                date: validation.data.date,
                category: validation.data.category,
                teamSize: validation.data.teamSize,
            },
        });

        return {
            status: "success",
            message: "Event updated successfully",
        };
    } catch (error) {
        console.error("Failed to update event:", error);
        return {
            status: "error",
            message: "Failed to update event"
        };
    }
}