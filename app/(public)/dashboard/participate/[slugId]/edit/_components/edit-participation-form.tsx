"use client";

import { useState } from "react";
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
import { Loader2, SaveIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { updateParticipationAction } from "../action";

interface EditParticipationFormProps {
  eventSlugId: string;
  participation: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    whatsappNumber: string | null;
    aadhaarNumber: string;
    state: string;
    district: string;
    collegeName: string;
    collegeAddress: string;
    status: string;
    registeredAt: Date;
  };
  event: {
    id: string;
    title: string;
    slugId: string;
  };
}

export function EditParticipationForm({ eventSlugId, participation, event }: EditParticipationFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ParticipationSchemaType>({
    resolver: zodResolver(participationSchema),
    defaultValues: {
      fullName: participation.fullName,
      email: participation.email,
      mobileNumber: participation.mobileNumber,
      whatsappNumber: participation.whatsappNumber || "",
      aadhaarNumber: participation.aadhaarNumber,
      state: participation.state,
      district: participation.district,
      collegeName: participation.collegeName,
      collegeAddress: participation.collegeAddress,
    },
  });

  function onSubmit(values: ParticipationSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateParticipationAction(eventSlugId, values));
      
      if (error) {
        toast.error("Error updating participation: " + error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        router.push("/dashboard/participate");
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to update participation");
      }
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PAYMENT_SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-800';
      case 'REGISTERED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Edit Registration Details
          </CardTitle>
          <CardDescription>
            Update your information below. All required fields must be filled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
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
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="10-digit mobile number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="10-digit WhatsApp number (optional)" 
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
                        <FormLabel>Aadhaar Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="12-digit Aadhaar number" 
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Details</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your state" 
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
                        <FormLabel>District *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your district" 
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">College Information</h3>
                
                <FormField
                  control={form.control}
                  name="collegeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your college name" 
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
                      <FormLabel>College Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your college complete address" 
                          rows={3}
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={pending}
                    className="flex-1"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Update Registration
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.push("/dashboard/participate")}
                    disabled={pending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}