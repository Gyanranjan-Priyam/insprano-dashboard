import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { getEventBySlugId } from "@/app/data/admin/events";
import { formatDistanceToNow } from "date-fns";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import ImageGallery from "@/components/admin_components/gallery/ImageGallery";
import HeroBackgroundImage from "@/components/ui/hero-background-image";
import {
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  EditIcon,
  FileTextIcon,
  ImageIcon,
  IndianRupee,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

// Helper function to construct full URL
const getFileUrl = (key: string) => {
  if (!key) return "";
  // If it's already a full URL, return as is
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  // Otherwise, construct the full URL
  return `https://registration.t3.storage.dev/${key}`;
};

// Helper function to safely parse JSON content
const parseContent = (content: any) => {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse JSON content:", error);
      // Return a simple text node structure for TipTap
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: content,
              },
            ],
          },
        ],
      };
    }
  }
  return content;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slugId: string }>;
}) {
  try {
    const { slugId } = await params;
    const event = await getEventBySlugId(slugId);

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Hero Section with Thumbnail Background */}
        <div className="relative overflow-hidden rounded-lg">
          {/* Background Image */}
          <div className="absolute inset-0">
            {event.thumbnailKey && (
              <HeroBackgroundImage
                src={getFileUrl(event.thumbnailKey)}
                alt={`${event.title} background`}
              />
            )}
            {/* Always show gradient background as base */}
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/40" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-12 md:px-12 md:py-20">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
              {/* Event Details */}
              <div className="flex-1 space-y-4 md:space-y-6 text-white">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="text-sm md:text-base px-3 py-1">
                      <TagIcon className="w-4 h-4 mr-2" />
                      {event.category}
                    </Badge>
                    <p className="text-sm md:text-base text-white/80">
                      Created{" "}
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* Event Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Event Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80">
                      <CalendarIcon className="w-5 h-5" />
                      <span className="text-sm md:text-base font-medium">Event Date</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long", 
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Registration Fee */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80">
                      <IndianRupee className="w-5 h-5" />
                      <span className="text-sm md:text-base font-medium">Registration Fee</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">
                      {event.price === 0 ? "Free" : `₹${event.price}`}
                    </p>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-5 h-5" />
                      <span className="text-sm md:text-base font-medium">Team Size</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-blue-400">
                      {event.teamSize || 4} Members
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="lg:shrink-0">
                <Button asChild size="lg" className="w-full lg:w-auto bg-white text-black hover:bg-white/90">
                  <Link href={`/admin/events/${event.slugId}/edit`}>
                    <EditIcon className="w-5 h-5 mr-2" />
                    Edit Event
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Main Content */}
          <div className="space-y-4 md:space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Event Description</CardTitle>
              </CardHeader>
                  <Separator />
              <CardContent className="prose prose-sm md:prose-base max-w-none">
                <RenderDescription json={parseContent(event.description)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Event Media</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6">
                {/* Gallery Section */}
                {event.imageKeys && event.imageKeys.length > 0 && (
                  <div>
                    <ImageGallery
                      images={event.imageKeys}
                      title={`${event.title} Gallery`}
                      autoPlay={true}
                      autoPlayInterval={5000}
                    />
                  </div>
                )}
                {event.imageKeys && event.imageKeys.length > 0}
              </CardContent>
            </Card>
                

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileTextIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Rules & Guidelines
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="prose prose-sm md:prose-base max-w-none">
                <RenderDescription json={parseContent(event.rules)} />
              </CardContent>
              <Separator />
              <CardContent className="pt-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      PDF Document
                    </span>
                  </div>
                  {event.pdfKey ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link
                        href={getFileUrl(event.pdfKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View PDF
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled
                    >
                      No PDF Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
