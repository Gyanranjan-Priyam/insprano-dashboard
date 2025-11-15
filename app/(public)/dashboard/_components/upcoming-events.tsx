"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { type JSONContent } from "@tiptap/react";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";

interface Event {
  id: string;
  slugId: string;
  title: string;
  category: string;
  date: Date;
  venue: string;
  price: number;
  description: JSONContent | string;
}

interface UpcomingEventsProps {
  events: Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Robosprano': 'bg-purple-100 text-purple-800 border-purple-200',
      'Hackathon': 'bg-blue-100 text-blue-800 border-blue-200',
      'Civil': 'bg-green-100 text-green-800 border-green-200',
      'Mechanical': 'bg-orange-100 text-orange-800 border-orange-200',
      'ComputerScience': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Electrical': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Gaming': 'bg-pink-100 text-pink-800 border-pink-200',
      'OtherEvent': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || colors['OtherEvent'];
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>
            Discover new events you can register for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
            <p className="text-muted-foreground mb-4">
              There are no upcoming events available at the moment. Check back later!
            </p>
            <Button asChild>
              <Link href="/dashboard/events">
                Browse All Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          Upcoming Events
        </CardTitle>
        <CardDescription className="text-sm">
          Discover new events you can register for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {events.slice(0, 3).map((event) => (
            <div 
              key={event.id} 
              className="group p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                  </div>
                  <Badge className={getCategoryColor(event.category)} variant="outline">
                    <Tag className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs">{event.category.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 space-y-2 sm:space-y-0">
                  <span className="text-base sm:text-lg font-semibold text-primary">
                    {formatCurrency(event.price)}
                  </span>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button size="sm" variant="outline" asChild className="text-xs">
                      <Link href={`/dashboard/events/${event.slugId}`}>
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View Details
                      </Link>
                    </Button>
                    
                    <Button size="sm" asChild className="text-xs">
                      <Link href={`/dashboard/participate/${event.slugId}`}>
                        Register Now
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {events.length > 3 && (
            <div className="text-center pt-4 border-t">
              <Button variant="outline" asChild className="w-full sm:w-auto text-sm">
                <Link href="/dashboard/events">
                  Explore All Events ({events.length} available)
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}