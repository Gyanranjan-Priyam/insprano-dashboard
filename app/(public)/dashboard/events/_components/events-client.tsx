"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, UsersIcon, Search, Filter, X } from "lucide-react";
import Image from "next/image";

type Event = {
   id: string;
   title: string;
   description: string;
   slugId: string;
   thumbnailKey: string;
   category: string;
   priceType: "free" | "paid";
   price: number;
   venue: string;
   date: Date;
};

interface EventsClientProps {
   events: Event[];
}

export function EventsClient({ events }: EventsClientProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("all");

   // Get unique categories from events
   const categories = useMemo(() => {
      const uniqueCategories = Array.from(new Set(events.map(event => event.category)));
      return ["all", ...uniqueCategories];
   }, [events]);

   // Filter events based on search and category
   const filteredEvents = useMemo(() => {
      return events.filter(event => {
         const matchesSearch = searchQuery === "" || 
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            extractTextFromDescription(event.description).toLowerCase().includes(searchQuery.toLowerCase());
         
         const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
         
         return matchesSearch && matchesCategory;
      });
   }, [events, searchQuery, selectedCategory]);

   const extractTextFromDescription = (description: string): string => {
      try {
         const parsed = JSON.parse(description);
         // Extract text from TipTap JSON
         const extractText = (content: any): string => {
            if (!content) return '';
            if (Array.isArray(content)) {
               return content.map(extractText).join(' ');
            }
            if (content.type === 'text') {
               return content.text || '';
            }
            if (content.content) {
               return extractText(content.content);
            }
            return '';
         };
         return extractText(parsed.content) || '';
      } catch {
         return description || '';
      }
   };

   const getFileUrl = (key: string) => {
      const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
      return `https://${bucketName}.t3.storage.dev/${key}`;
   };

   const clearFilters = () => {
      setSearchQuery("");
      setSelectedCategory("all");
   };

   const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all";

   return (
      <>
         {/* Search and Filter Controls */}
         <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
               {/* Search Input */}
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                     placeholder="Search events by title, venue, or description..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10"
                  />
               </div>

               {/* Category Filter */}
               <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                     <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.slice(1).map((category) => (
                           <SelectItem key={category} value={category}>
                              {category}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               {/* Clear Filters Button */}
               {hasActiveFilters && (
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={clearFilters}
                     className="flex items-center gap-2"
                  >
                     <X className="w-4 h-4" />
                     Clear
                  </Button>
               )}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
               <span>
                  Showing {filteredEvents.length} of {events.length} events
                  {hasActiveFilters && " (filtered)"}
               </span>
               {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                     <span>Active filters:</span>
                     {searchQuery && (
                        <Badge variant="secondary" className="text-xs">
                           Search: "{searchQuery}"
                        </Badge>
                     )}
                     {selectedCategory !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                           Category: {selectedCategory}
                        </Badge>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Events Grid */}
         {filteredEvents.length === 0 ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                     <h3 className="text-lg font-semibold mb-2">
                        {hasActiveFilters ? "No events match your filters" : "No Events Available"}
                     </h3>
                     <p className="text-muted-foreground mb-4">
                        {hasActiveFilters 
                           ? "Try adjusting your search or filter criteria to find more events."
                           : "There are no events available for registration at the moment. Please check back later for upcoming events."
                        }
                     </p>
                     {hasActiveFilters ? (
                        <Button onClick={clearFilters}>
                           Clear Filters
                        </Button>
                     ) : (
                        <Link href="/dashboard">
                           <Button>Back to Dashboard</Button>
                        </Link>
                     )}
                  </div>
               </CardContent>
            </Card>
         ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden">
                     {/* Thumbnail Image */}
                     <div className="relative h-48 w-full">
                        <Image
                           src={getFileUrl(event.thumbnailKey)}
                           alt={event.title}
                           fill
                           className="object-cover"
                           priority
                        />
                        <div className="absolute top-2 right-2">
                           <Badge variant="secondary" className="bg-white/90 text-black">
                              {event.category}
                           </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                           <Badge className="bg-primary text-primary-foreground">
                              {(event.priceType === "free" || event.price === 0) ? "Free" : `₹${event.price}`}
                           </Badge>
                        </div>
                     </div>

                     <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                           {extractTextFromDescription(event.description) || 'No description available'}
                        </CardDescription>
                     </CardHeader>
                     
                     <CardContent className="pt-0">
                        <div className="space-y-2 mb-4">
                           <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric'
                              })}
                           </div>
                           {event.venue && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                 <MapPinIcon className="w-4 h-4 mr-2" />
                                 {event.venue}
                              </div>
                           )}
                           <div className="flex items-center text-sm text-muted-foreground">
                              <UsersIcon className="w-4 h-4 mr-2" />
                              Available for Registration
                           </div>
                        </div>
                        
                        <div className="flex gap-2">
                           <Button asChild className="flex-1">
                              <Link href={`/dashboard/events/${event.slugId}`}>
                                 View Details
                              </Link>
                           </Button>
                           <Button variant="outline" asChild className="flex-1">
                              <Link href={`/dashboard/participate/${event.slugId}`}>
                                 Register
                              </Link>
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}
      </>
   );
}