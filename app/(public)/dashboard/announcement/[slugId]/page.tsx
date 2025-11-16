import { notFound } from "next/navigation";
import { AnnouncementClient } from "./_components/announcement-client";
import { prisma } from "@/lib/db";
import { type JSONContent } from "@tiptap/react";

interface AnnouncementData {
  id: string;
  slugId: string;
  title: string;
  description: JSONContent | string | null | undefined;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  attachmentKeys: string[];
  imageKeys: string[];
  relatedEvent?: {
    id: string;
    title: string;
    slugId: string;
    description: string;
    date: string;
  };
  createdBy: string;
}

// Fetch announcement data directly from database
async function getAnnouncement(slugId: string): Promise<AnnouncementData | null> {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { slugId },
      include: {
        relatedEvent: {
          select: {
            id: true,
            title: true,
            slugId: true,
            description: true,
            date: true,
          }
        }
      }
    });

    if (!announcement) {
      return null;
    }

    return {
      id: announcement.id,
      slugId: announcement.slugId,
      title: announcement.title,
      description: announcement.description as JSONContent | string,
      category: announcement.category,
      priority: announcement.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
      createdAt: announcement.createdAt.toISOString(),
      updatedAt: announcement.updatedAt.toISOString(),
      attachmentKeys: announcement.attachmentKeys || [],
      imageKeys: announcement.imageKeys || [],
      relatedEvent: announcement.relatedEvent ? {
        id: announcement.relatedEvent.id,
        title: announcement.relatedEvent.title,
        slugId: announcement.relatedEvent.slugId,
        description: announcement.relatedEvent.description,
        date: announcement.relatedEvent.date.toISOString(),
      } : undefined,
      createdBy: announcement.createdBy,
    };
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }
}

export default async function AnnouncementPage({ params }: { params: Promise<{ slugId: string }> }) {
  const { slugId } = await params;
  const announcement = await getAnnouncement(slugId);

  if (!announcement) {
    notFound();
  }

  return <AnnouncementClient announcement={announcement} />;
}
