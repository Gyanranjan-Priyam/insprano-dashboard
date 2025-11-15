import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircleIcon } from "lucide-react";
import { getPublicEventBySlugId } from "@/app/data/public/events";
import { getUserParticipationByEventId } from "@/app/data/public/participations";
import { RegistrationForm } from "./_components/registration-form";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function ParticipateEventPage({ 
   params 
}: { 
   params: Promise<{ slugId: string }> 
}) {
   const { slugId } = await params;
   
   let event: any = null;
   let participation: any = null;
   let error: string | null = null;

   try {
      event = await getPublicEventBySlugId(slugId);
      participation = await getUserParticipationByEventId(event.id);
   } catch (err) {
      console.error('Failed to fetch event:', err);
      error = 'Event not found or failed to load.';
   }

   if (error || !event) {
      redirect('/dashboard/events');
   }

   return (
      <div className="p-4 sm:p-6 lg:p-8">
         <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold">Event Registration</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
               {participation ? 'You are already registered for this event' : 'Complete your registration by filling in the details below'}
            </p>
         </div>

         {participation ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="text-center space-y-3 sm:space-y-4 px-4">
                     <div className="flex items-center justify-center text-green-600">
                        <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 mr-2" />
                     </div>
                     <div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Already Registered!</h3>
                        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                           You have already registered for <strong>{event.title}</strong>
                        </p>
                        <Badge className="bg-green-100 text-green-800 mb-4 text-xs sm:text-sm">
                           Status: {participation.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mb-4 sm:mb-6">
                           Registered on {new Date(participation.registeredAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                           })}
                        </div>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button asChild size="sm" className="h-9 sm:h-10 text-sm">
                           <Link href="/dashboard/participate">
                              View My Participations
                           </Link>
                        </Button>
                        <Button variant="outline" asChild size="sm" className="h-9 sm:h-10 text-sm">
                           <Link href={`/dashboard/events/${event.slugId}`}>
                              View Event Details
                           </Link>
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <RegistrationForm event={event} />
         )}
      </div>
   )
}
