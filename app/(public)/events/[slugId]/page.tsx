import { getPublicEventBySlugId } from "@/app/data/public/events";
import { notFound } from "next/navigation";
import { AnimatedEventPage } from "./_components/animated-event-page";

export default async function PublicEventPage({ params }: { params: Promise<{ slugId: string }> }) {
  try {
    const { slugId } = await params;
    const event = await getPublicEventBySlugId(slugId);

    return <AnimatedEventPage event={event} />;
  } catch (error) {
    return notFound();
  }
}