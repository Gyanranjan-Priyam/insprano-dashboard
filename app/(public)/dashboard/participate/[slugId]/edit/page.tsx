import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon, AlertCircleIcon } from "lucide-react";
import { getParticipationForEdit } from "./action";
import { EditParticipationForm } from "./_components/edit-participation-form";
import { redirect } from "next/navigation";

export default async function EditParticipationPage({ 
   params 
}: { 
   params: Promise<{ slugId: string }> 
}) {
   const { slugId } = await params;
   
   const result = await getParticipationForEdit(slugId);

   if (result.status === "error") {
      return (
         <div className="p-8">
            <div className="mb-6">
               <h1 className="text-3xl font-semibold">Edit Registration</h1>
            </div>

            <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                     <AlertCircleIcon className="w-16 h-16 mx-auto text-red-500" />
                     <div>
                        <h3 className="text-xl font-semibold mb-2 text-red-600">Error</h3>
                        <p className="text-muted-foreground mb-4">
                           {result.message}
                        </p>
                     </div>
                     <div className="flex gap-4 justify-center">
                        <Button asChild>
                           <Link href="/dashboard/participate">
                              View My Participations
                           </Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/dashboard/events">
                              Browse Events
                           </Link>
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   const { participation, event } = result.data || { participation: null, event: null };

   if (!participation || !event) {
      return (
         <div className="p-8">
            <div className="mb-6">
               <h1 className="text-3xl font-semibold">Edit Registration</h1>
            </div>

            <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                     <AlertCircleIcon className="w-16 h-16 mx-auto text-red-500" />
                     <div>
                        <h3 className="text-xl font-semibold mb-2 text-red-600">Data Not Found</h3>
                        <p className="text-muted-foreground mb-4">
                           Participation or event data could not be loaded.
                        </p>
                     </div>
                     <div className="flex gap-4 justify-center">
                        <Button asChild>
                           <Link href="/dashboard/participate">
                              View My Participations
                           </Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/dashboard/events">
                              Browse Events
                           </Link>
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   return (
      <div className="p-8">
         <div className="mb-6">
            <h1 className="text-3xl font-semibold">Edit Registration</h1>
            <p className="mt-2 text-sm text-muted-foreground">
               Update your registration details for {event.title}
            </p>
         </div>

         <EditParticipationForm 
            eventSlugId={slugId}
            participation={participation}
            event={event}
         />
      </div>
   );
}