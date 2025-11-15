"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participationSchema, ParticipationSchemaType } from "@/lib/zodSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, UserPlusIcon, CalendarIcon, MapPinIcon, TagIcon, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { useRegistrationData } from "@/hooks/use-registration-data";
import { registerWithDetailsAction } from "../../action";

interface RegistrationFormProps {
  event: {
    id: string;
    slugId: string;
    title: string;
    category: string;
    priceType: "free" | "paid";
    price: number;
    date: Date;
    venue: string;
    thumbnailKey: string;
  };
}

export function RegistrationForm({ event }: RegistrationFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { data: registrationData, loading, error, metadata, refetch } = useRegistrationData();

  const form = useForm<ParticipationSchemaType>({
    resolver: zodResolver(participationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      whatsappNumber: "",
      aadhaarNumber: "",
      state: "",
      district: "",
      collegeName: "",
      collegeAddress: "",
    },
  });

  // Pre-fill form when registration data is loaded
  useEffect(() => {
    if (registrationData && !loading) {
      form.reset(registrationData);
    }
  }, [registrationData, loading, form]);

  // Handle refetch success
  const handleRefresh = async () => {
    toast.info("Refreshing your information...");
    await refetch();
    if (registrationData) {
      form.reset(registrationData);
      toast.success("Information updated successfully!");
    }
  };

  function onSubmit(values: ParticipationSchemaType) {
    startTransition(async () => {
      // Check if event is free - handle both new priceType field and legacy events
      const isFreeEvent = event.priceType === "free" || (event.price === 0);
      const isPaidEvent = event.priceType === "paid" || (event.price > 0 && event.priceType !== "free");
      
      if (isFreeEvent && !isPaidEvent) {
        // For free events, complete registration directly
        const { data: result, error } = await tryCatch(
          registerWithDetailsAction(event.id, values)
        );

        if (error) {
          toast.error("Error completing registration: " + error.message);
          return;
        }

        if (result?.status === "success") {
          toast.success(result.message);
          router.push("/dashboard/participate");
        } else {
          toast.error(result?.message || "Failed to complete registration");
        }
      } else {
        // For paid events, store form data and go to checkout
        sessionStorage.setItem('registrationData', JSON.stringify(values));
        router.push(`/dashboard/participate/${event.slugId}/checkout`);
      }
    });
  }

  const getFileUrl = (key: string) => {
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
    return `https://${bucketName}.t3.storage.dev/${key}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Event Summary Card */}
      <Card className="overflow-hidden border-0">
        <div 
          className="relative min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] xl:min-h-[350px] bg-cover bg-center bg-no-repeat rounded-lg sm:rounded-2xl lg:rounded-3xl border-primary/20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url(${getFileUrl(event.thumbnailKey)})`
          }}
        >
          <div className="absolute inset-0 p-3 sm:p-4 lg:p-6 xl:p-8 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-0">
            {/* Event Information */}
            <div className="flex-1 text-white flex flex-col justify-between">
              {/* Title Section - Top */}
              <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold leading-tight">
                  {event.title}
                </h1>
                <p className="text-white/90 text-xs sm:text-sm lg:text-base hidden sm:block">
                  You are registering for this event
                </p>
              </div>
              
              {/* Event Details - Bottom */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mt-3 sm:mt-4 lg:mt-0">
                <div className="flex items-start sm:items-center text-white/90">
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 sm:mr-3 lg:mr-4 mt-1 sm:mt-0 shrink-0" />
                  <div>
                    <div className="font-medium sm:font-semibold text-white text-xs sm:text-sm lg:text-base xl:text-lg">Event Date</div>
                    <div className="text-white/80 text-xs sm:text-sm lg:text-base">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start sm:items-center text-white/90">
                  <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 sm:mr-3 lg:mr-4 mt-1 sm:mt-0 shrink-0" />
                  <div>
                    <div className="font-medium sm:font-semibold text-white text-xs sm:text-sm lg:text-base xl:text-lg">Venue</div>
                    <div className="text-white/80 text-xs sm:text-sm lg:text-base">{event.venue}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="text-center bg-white/15 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 xl:p-6 border border-white/30 shadow-2xl">
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                  {(event.priceType === "free" || event.price === 0) ? "Free" : `₹${event.price}`}
                </div>
                <div className="text-white/80 mt-1 text-xs sm:text-sm">Registration Fee</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Form */}
      <div>
        <Card>
          <CardHeader className="px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg lg:text-xl">Registration Details</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Please fill in all the required details to complete your registration.
                  {!loading && !error && metadata && (
                    <span className="block mt-1 text-xs text-blue-600 dark:text-blue-400">
                      ✓ Your information has been pre-filled from your{' '}
                      {metadata.hasProfileData && metadata.hasParticipationData 
                        ? "profile and previous registrations" 
                        : metadata.hasProfileData 
                        ? "profile" 
                        : metadata.hasParticipationData 
                        ? "previous registrations" 
                        : "account"
                      }
                    </span>
                  )}
                  {!loading && !error && metadata && !metadata.hasProfileData && !metadata.hasParticipationData && (
                    <span className="block mt-1 text-xs text-gray-600 dark:text-gray-400">
                      💡 This form will be saved to your profile for future registrations
                    </span>
                  )}
                  {error && (
                    <span className="block mt-1 text-xs text-amber-600 dark:text-amber-400">
                      ⚠ Could not pre-fill your information. Please fill the form manually.
                    </span>
                  )}
                </CardDescription>
              </div>
              {!loading && (
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            form.reset({
                              fullName: "",
                              email: "",
                              mobileNumber: "",
                              whatsappNumber: "",
                              aadhaarNumber: "",
                              state: "",
                              district: "",
                              collegeName: "",
                              collegeAddress: "",
                            });
                            toast.info("Form cleared");
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear form</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh your information</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 lg:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading your information...</span>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Personal Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm lg:text-base">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm lg:text-base">Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm lg:text-base">Mobile Number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10-digit mobile number" 
                              className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm lg:text-base">WhatsApp Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10-digit WhatsApp number (optional)" 
                              className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aadhaarNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm lg:text-base">Aadhaar Number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="12-digit Aadhaar number" 
                              className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Location Details</h3>
                  
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm lg:text-base">State *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your state" 
                              className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm lg:text-base">District *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your district" 
                              className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* College Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold">College Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="collegeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm lg:text-base">College Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your college name" 
                            className="h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collegeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm lg:text-base">College Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your college complete address" 
                            rows={3}
                            className="text-xs sm:text-sm lg:text-base resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-3 sm:pt-4 lg:pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={pending}
                    className="w-full h-10 sm:h-11 lg:h-12 text-xs sm:text-sm lg:text-base"
                    size="lg"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {(event.priceType === "free" || event.price === 0) ? "Complete Registration" : "Proceed to Checkout"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}