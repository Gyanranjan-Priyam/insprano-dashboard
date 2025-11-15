import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getAllEvents } from "@/app/data/admin/events";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, TagIcon, MapPinIcon, IndianRupee } from "lucide-react";
import Image from "next/image";
import { DeleteEventButton } from "./_components/delete-event-button";

export default async function Page() {
   const events = await getAllEvents();

   const getFileUrl = (key: string) => {
      const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
      return `https://${bucketName}.t3.storage.dev/${key}`;
   };

   return(
      <>
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="space-y-1">
               <h1 className="text-2xl sm:text-3xl font-semibold">Event Management</h1>
               <p className="text-sm text-muted-foreground">Manage your events here.</p>
            </div>
            <div className="w-full sm:w-auto">
               <Link href="/admin/events/create" className="block">
                  <Button className="w-full sm:w-auto">Create Event</Button>
               </Link>
            </div>
         </div>

         {events.length === 0 ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="text-center space-y-4 max-w-md">
                     <h3 className="text-lg sm:text-xl font-semibold">No Events Found</h3>
                     <p className="text-sm sm:text-base text-muted-foreground">
                        There are no events created yet. Kindly create an event to get started.
                     </p>
                     <Link href="/admin/events/create" className="inline-block w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">Create Your First Event</Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
               {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden">
                     {/* Thumbnail Image */}
                     <div className="relative h-40 sm:h-48 w-full">
                        <Image
                           src={getFileUrl(event.thumbnailKey)}
                           alt={event.title}
                           fill
                           className="object-cover"
                           sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                           priority
                        />
                        <div className="absolute top-2 right-2">
                           <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                              <TagIcon className="w-3 h-3 mr-1 shrink-0" />
                              <span className="truncate">{event.category}</span>
                           </Badge>
                        </div>
                        <div className="absolute top-2 left-2">
                           <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                           </span>
                        </div>
                     </div>

                     <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-2 text-lg sm:text-xl font-semibold leading-tight">{event.title}</CardTitle>
                     </CardHeader>
                     
                     <CardContent className="pt-0 space-y-4">
                        <div className="space-y-2">
                           <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="w-4 h-4 mr-2 shrink-0" />
                              <span className="truncate">
                                 {new Date(event.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                 })}
                              </span>
                           </div>
                           <div className="flex items-center text-sm text-muted-foreground">
                              <IndianRupee className="w-4 h-4 mr-2 shrink-0" />
                              <span>₹{event.price}</span>
                           </div>
                           {event.venue && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                 <MapPinIcon className="w-4 h-4 mr-2 shrink-0" />
                                 <span className="truncate">{event.venue}</span>
                              </div>
                           )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                           <Button variant="outline" size="sm" asChild className="flex">
                              <Link href={`/admin/events/${event.slugId}/edit`}>
                                 Edit
                              </Link>
                           </Button>
                           <Button variant="secondary" size="sm" asChild className="flex">
                              <Link href={`/admin/events/${event.slugId}`}>
                                 View
                              </Link>
                           </Button>
                           <div className="flex justify-center sm:block ">
                              <DeleteEventButton 
                                 slugId={event.slugId} 
                                 eventTitle={event.title}
                              />
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}

      </>
   )
}