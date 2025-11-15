"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";

export async function deleteEvent(slugId: string): Promise<ApiResponse> {
    try {
        // Ensure only admin can delete events
        await requireAdmin();

        // Check if event exists
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

        // Delete the event
        await prisma.event.delete({
            where: {
                slugId: slugId
            }
        });

        return {
            status: "success",
            message: "Event deleted successfully"
        };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return {
            status: "error",
            message: "Failed to delete event"
        };
    }
}