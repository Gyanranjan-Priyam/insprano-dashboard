import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, ExternalLinkIcon, EyeIcon, MoreHorizontalIcon, UploadIcon, EditIcon, UsersIcon } from "lucide-react";
import { getUserParticipations } from "@/app/data/public/participations";
import Image from "next/image";
import { ReuploadDialog } from "./_components/reupload-dialog";
import { isRegistrationEnabled } from "@/lib/system-settings";
import { redirect } from "next/navigation";

export default async function ParticipatePage() {
   // Check if registration is enabled
   const registrationEnabled = await isRegistrationEnabled();
   
   if (!registrationEnabled) {
      redirect("/thank-you");
   }

   let participations: any[] = [];
   let error: string | null = null;

   try {
      participations = await getUserParticipations();
   } catch (err) {
      console.error('Failed to fetch participations:', err);
      error = 'Failed to load your participations. Please try again later.';
   }

   const getFileUrl = (key: string) => {
      const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
      return `https://${bucketName}.t3.storage.dev/${key}`;
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'REGISTERED':
            return 'bg-blue-100 text-blue-800';
         case 'CONFIRMED':
            return 'bg-green-100 text-green-800';
         case 'CANCELLED':
            return 'bg-red-100 text-red-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
   };

   return (
      <div className="p-4 sm:p-6 lg:p-8">
         <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold">My Participations</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
               View and manage your event registrations and participation status.
            </p>
         </div>

         {error ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="text-center px-4">
                     <h3 className="text-lg sm:text-xl font-semibold mb-2 text-destructive">Error Loading Participations</h3>
                     <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error}</p>
                     <Button onClick={() => window.location.reload()} size="sm" className="h-9 sm:h-10">
                        Try Again
                     </Button>
                  </div>
               </CardContent>
            </Card>
         ) : participations.length === 0 ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <div className="text-center px-4">
                     <h3 className="text-lg sm:text-xl font-semibold mb-2">No Event Participations</h3>
                     <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        You have not participated in any events yet. Kindly participate once to see your events here.
                     </p>
                     <Link href="/dashboard/events">
                        <Button size="sm" className="h-9 sm:h-10">Browse Available Events</Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <Card>
               <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Your Event Participations</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                     You are registered for {participations.length} event{participations.length !== 1 ? 's' : ''}.
                  </CardDescription>
               </CardHeader>
               <CardContent className="px-4 sm:px-6">
                  {/* Mobile View - Card Layout */}
                  <div className="block sm:hidden space-y-4">
                     {participations.map((participation) => (
                        <Card key={participation.id} className="border border-border">
                           <CardContent className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                 <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden shrink-0">
                                    <Image
                                       src={getFileUrl(participation.event.thumbnailKey)}
                                       alt={participation.event.title}
                                       fill
                                       className="object-cover"
                                       priority
                                    />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm leading-tight mb-1">{participation.event.title}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">{participation.event.slugId}</p>
                                    <Badge variant="secondary" className="text-xs">{participation.event.category}</Badge>
                                 </div>
                              </div>
                              
                              <div className="space-y-2 text-xs">
                                 <div className="flex items-center">
                                    <CalendarIcon className="w-3 h-3 mr-2 text-muted-foreground shrink-0" />
                                    <span>{new Date(participation.event.date).toLocaleDateString('en-US', {
                                       year: 'numeric',
                                       month: 'short',
                                       day: 'numeric'
                                    })}</span>
                                 </div>
                                 <div className="flex items-center">
                                    <MapPinIcon className="w-3 h-3 mr-2 text-muted-foreground shrink-0" />
                                    <span className="truncate">{participation.event.venue}</span>
                                 </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                 <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">₹{participation.event.price}</span>
                                    <Badge className={`text-xs ${getStatusColor(participation.status)}`}>
                                       {participation.status}
                                    </Badge>
                                 </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontalIcon className="w-4 h-4" />
                                       </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                       <DropdownMenuItem asChild>
                                          <ReuploadDialog 
                                             participationId={participation.id}
                                             participantName={participation.fullName || "Participant"}
                                             eventTitle={participation.event.title}
                                          />
                                       </DropdownMenuItem>
                                       <DropdownMenuItem asChild>
                                          <Link href={`/dashboard/participate/${participation.event.slugId}/edit`} className="flex items-center">
                                             <EditIcon className="w-4 h-4 mr-2" />
                                             Edit
                                          </Link>
                                       </DropdownMenuItem>
                                       <DropdownMenuItem asChild>
                                          <Link href={`/dashboard/teams`} className="flex items-center">
                                             <UsersIcon className="w-4 h-4 mr-2" />
                                             Create Team
                                          </Link>
                                       </DropdownMenuItem>
                                       <DropdownMenuItem asChild>
                                          <Link href={`/dashboard/events/${participation.event.slugId}`} className="flex items-center">
                                             <EyeIcon className="w-4 h-4 mr-2" />
                                             View Event
                                          </Link>
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </div>
                           </CardContent>
                        </Card>
                     ))}
                  </div>

                  {/* Desktop View - Table Layout */}
                  <div className="hidden sm:block rounded-md border overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="text-sm">Event</TableHead>
                              <TableHead className="text-sm">Category</TableHead>
                              <TableHead className="text-sm">Date</TableHead>
                              <TableHead className="text-sm">Venue</TableHead>
                              <TableHead className="text-sm">Price</TableHead>
                              <TableHead className="text-sm">Status</TableHead>
                              <TableHead className="text-sm">Registered</TableHead>
                              <TableHead className="text-right text-sm">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {participations.map((participation) => (
                              <TableRow key={participation.id}>
                                 <TableCell>
                                    <div className="flex items-center space-x-3">
                                       <div className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden shrink-0">
                                          <Image
                                             src={getFileUrl(participation.event.thumbnailKey)}
                                             alt={participation.event.title}
                                             fill
                                             className="object-cover"
                                             priority
                                          />
                                       </div>
                                       <div className="min-w-0">
                                          <div className="font-medium text-sm lg:text-base truncate">{participation.event.title}</div>
                                          <div className="text-xs lg:text-sm text-muted-foreground truncate">
                                             {participation.event.slugId}
                                          </div>
                                       </div>
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    <Badge variant="secondary" className="text-xs">{participation.event.category}</Badge>
                                 </TableCell>
                                 <TableCell>
                                    <div className="flex items-center text-xs lg:text-sm">
                                       <CalendarIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-2 text-muted-foreground shrink-0" />
                                       <span className="hidden lg:inline">
                                          {new Date(participation.event.date).toLocaleDateString('en-US', {
                                             year: 'numeric',
                                             month: 'short',
                                             day: 'numeric'
                                          })}
                                       </span>
                                       <span className="lg:hidden">
                                          {new Date(participation.event.date).toLocaleDateString('en-US', {
                                             month: 'short',
                                             day: 'numeric'
                                          })}
                                       </span>
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    <div className="flex items-center text-xs lg:text-sm">
                                       <MapPinIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-2 text-muted-foreground shrink-0" />
                                       <span className="truncate max-w-[100px] lg:max-w-none">{participation.event.venue}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="font-medium text-xs lg:text-sm">
                                    ₹{participation.event.price}
                                 </TableCell>
                                 <TableCell>
                                    <Badge className={`text-xs ${getStatusColor(participation.status)}`}>
                                       {participation.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-xs lg:text-sm text-muted-foreground">
                                    <span className="hidden lg:inline">
                                       {new Date(participation.registeredAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                       })}
                                    </span>
                                    <span className="lg:hidden">
                                       {new Date(participation.registeredAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric'
                                       })}
                                    </span>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                             <MoreHorizontalIcon className="w-4 h-4" />
                                          </Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent align="end" className="w-56">
                                          <DropdownMenuItem asChild>
                                             <ReuploadDialog 
                                                participationId={participation.id}
                                                participantName={participation.fullName || "Participant"}
                                                eventTitle={participation.event.title}
                                             />
                                          </DropdownMenuItem>
                                          <DropdownMenuItem asChild>
                                             <Link href={`/dashboard/participate/${participation.event.slugId}/edit`} className="flex items-center">
                                                <EditIcon className="w-4 h-4 mr-2" />
                                                Edit
                                             </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem asChild>
                                             <Link href={`/dashboard/teams`} className="flex items-center">
                                                <UsersIcon className="w-4 h-4 mr-2" />
                                                Create Team
                                             </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem asChild>
                                             <Link href={`/dashboard/events/${participation.event.slugId}`} className="flex items-center">
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                View Event
                                             </Link>
                                          </DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   )
}
