"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { eventSchema, EventSchemaType } from "@/lib/zodSchema";

export async function CreateEvent(values: EventSchemaType): Promise<ApiResponse> {
    
    try {
        // Ensure only admin can create events
        await requireAdmin();

        const validation = eventSchema.safeParse(values);

        if (!validation.success) {
            return {
                status: "error",
                message: "Invalid form data"
            }
        }

        // Check if slugId already exists
        const existingEvent = await prisma.event.findUnique({
            where: {
                slugId: validation.data.slugId
            }
        });

        if (existingEvent) {
            return {
                status: "error",
                message: "An event with this slug ID already exists"
            }
        }

        await prisma.event.create({
            data: {
                title: validation.data.title,
                slugId: validation.data.slugId,
                description: validation.data.description,
                rules: validation.data.rules,
                thumbnailKey: validation.data.thumbnailKey,
                pdfKey: validation.data.pdfKey,
                imageKeys: validation.data.imageKeys,
                price: validation.data.price,
                priceType: validation.data.priceType,
                venue: validation.data.venue,
                date: validation.data.date,
                category: validation.data.category,
                teamSize: validation.data.teamSize,
            },
        });

        return {
            status: "success",
            message: "Event created successfully",
        }
    } catch (error) {
        console.error("Failed to create event:", error);
        return {
            status: "error",
            message: "Failed to create event"
        }
    }
}
