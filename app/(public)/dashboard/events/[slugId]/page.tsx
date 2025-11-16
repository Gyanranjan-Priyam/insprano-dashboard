import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getPublicEventBySlugId } from "@/app/data/public/events";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import {
  CalendarIcon,
  TagIcon,
  FileTextIcon,
  ImageIcon,
  UsersIcon,
  IndianRupee,
  Share2,
} from "lucide-react";
import { notFound } from "next/navigation";
import { ImageCarousel } from "./_components/ImageCarousel";
import { ShareSocialCard } from "./_components/share-social-card";
import { getAbsoluteUrl } from "@/lib/utils/get-base-url";

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

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slugId: string }>;
}) {
  try {
    const { slugId } = await params;
    const event = await getPublicEventBySlugId(slugId);

    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/30">
        {/* Hero Section */}
        <div
          className="relative min-h-[60vh] bg-cover bg-center bg-no-repeat border-b"
          style={{
            backgroundImage: event.thumbnailKey
              ? `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(${getFileUrl(
                  event.thumbnailKey
                )})`
              : "linear-gradient(to right, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))",
          }}
        >
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="w-fit bg-white/20 backdrop-blur text-white border-white/30"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {event.category}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                {event.title}
              </h1>
              <div className="flex flex-wrap mt-90 gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg border border-white/30">
                  <CalendarIcon className="w-5 h-5 text-white" />
                  <span className="font-medium text-white">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg border border-white/30">
                  <IndianRupee className="w-5 h-5 text-white" />
                  <span className="text-2xl font-bold text-white">
                    {(event.priceType === "free" || event.price === 0) ? "Free" : `${event.price}`}
                  </span>
                  <span className="text-sm text-white/80">
                    Registration Fee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">About This Event</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent>
                  <RenderDescription json={parseContent(event.description)} />
                </CardContent>
              </Card>

              {/* Rules & Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileTextIcon className="w-6 h-6" />
                    Rules & Guidelines
                  </CardTitle>
                  <CardDescription>
                    Please read these carefully before registering
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent>
                  <RenderDescription json={parseContent(event.rules)} />
                </CardContent>
                <Separator />
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Download Rule Book</h4>
                  {event.pdfKey ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link
                        href={getFileUrl(event.pdfKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        Download PDF Rules
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled
                    >
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      No PDF Available
                    </Button>
                  )}
                </div>
              </Card>

              {/* Event Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <ImageIcon className="w-6 h-6" />
                    Event Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Event Gallery</h4>
                    {/* Get all available images - assuming imageKeys is an array or thumbnailKey as fallback */}
                    {(() => {
                      const images = [];

                      // Add thumbnail image if available
                      if (event.thumbnailKey) {
                        images.push(event.thumbnailKey);
                      }

                      // Add additional images if imageKeys array exists
                      if (event.imageKeys && Array.isArray(event.imageKeys)) {
                        images.push(
                          ...event.imageKeys.filter(
                            (key) => key && key !== event.thumbnailKey
                          )
                        );
                      }

                      return <ImageCarousel images={images} />;
                    })()}
                  </div>
                  <Separator />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">
                    Ready to Join?
                  </CardTitle>
                  <CardDescription>
                    Secure your spot in this amazing event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {(event.priceType === "free" || event.price === 0) ? "Free" : `₹${event.price}`}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registration Fee
                    </p>
                  </div>
                  <Button asChild className="flex-1 w-full">
                    <Link href={`/dashboard/participate/${event.slugId}`}>
                      Register
                    </Link>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full cursor-pointer">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md mx-4">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Share Event</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                          Share "{event.title}" with your friends and colleagues
                        </DialogDescription>
                      </DialogHeader>
                      <ShareSocialCard
                        title={event.title}
                        description={`Join us for ${event.title} on ${new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}. ${(event.priceType === "free" || event.price === 0) ? "Free registration!" : `Registration fee: ₹${event.price}`}`}
                        url={getAbsoluteUrl(`/events/${event.slugId}`)}
                      />
                    </DialogContent>
                  </Dialog>
                  <p className="text-xs text-center text-muted-foreground">
                    Registration closes on event date
                  </p>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {event.category}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Event Date
                    </p>
                    <p className="font-medium mt-1">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        timeZone: "UTC",
                        timeZoneName: "short",
                      })}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Event ID
                    </p>
                    <p className="text-xs font-mono mt-1 bg-muted px-2 py-1 rounded">
                      {event.slugId}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Have questions about this event? Get in touch with our team.
                  </p>
                  <Link
                    href="/dashboard/contact-support"
                    className={buttonVariants({
                      variant: "outline",
                      className: "w-full text-center",
                    })}
                  >
                    <span>Contact Support</span>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
