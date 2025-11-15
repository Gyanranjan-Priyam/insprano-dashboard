import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllPublicEvents } from "@/app/data/public/events";
import { EventsClient } from "./_components/events-client";

export default async function EventsPage() {
   let events: any[] = [];
   let error: string | null = null;

   try {
      events = await getAllPublicEvents();
   } catch (err) {
      console.error('Failed to fetch events:', err);
      error = 'Failed to load events. Please try again later.';
   }

   return (
      <div className="p-8">
         <div className="mb-8">
            <h1 className="text-3xl font-semibold">Available Events</h1>
            <p className="mt-2 text-sm text-muted-foreground">
               Discover and register for exciting events happening around campus.
            </p>
         </div>

         {error ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                     <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Events</h3>
                     <p className="text-muted-foreground mb-4">{error}</p>
                     <Button onClick={() => window.location.reload()}>
                        Try Again
                     </Button>
                  </div>
               </CardContent>
            </Card>
         ) : events.length === 0 ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                     <h3 className="text-lg font-semibold mb-2">No Events Available</h3>
                     <p className="text-muted-foreground mb-4">
                        There are no events available for registration at the moment. 
                        Please check back later for upcoming events.
                     </p>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <EventsClient events={events} />
         )}
      </div>
   )
}
