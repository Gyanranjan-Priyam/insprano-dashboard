import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getPublicEventBySlugId } from "@/app/data/public/events";
import { CheckoutForm } from "./_components/checkout-form";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getAdminUpiId, getDefaultUpiId } from "@/app/data/admin/get-admin-upi";

export default async function CheckoutPage({ 
   params 
}: { 
   params: Promise<{ slugId: string }> 
}) {
   const { slugId } = await params;
   
   let event: any = null;
   let error: string | null = null;

   try {
      // slugId is the actual event slug in this route
      event = await getPublicEventBySlugId(slugId);
   } catch (err) {
      console.error('Failed to fetch event:', err);
      error = 'Event not found or failed to load.';
   }

   if (error || !event) {
      redirect('/dashboard/events');
   }

   // Get UPI ID from admin profile with fallback
   const upiResult = await getAdminUpiId();
   const upiId = upiResult.upiId || getDefaultUpiId();
   
   // If admin hasn't configured UPI ID, show a warning (optional)
   const upiWarning = !upiResult.success || !upiResult.upiId ? 
      "Using default UPI ID. Admin should configure UPI ID in settings." : null;

   // UPI QR Code data using admin's UPI ID
   const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${upiId}&pn=Event Registration&am=${event.price}&cu=INR&tn=Registration for ${event.title}`;

   return (
      <div className="p-4 sm:p-8">
         <div className="mb-6">
            <Link href={`/dashboard/participate/${event.slugId}`}>
               <Button variant="outline" size="sm" className="mb-4">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Registration
               </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold">Complete Payment</h1>
            <p className="mt-2 text-sm text-muted-foreground">
               Scan the QR code to make payment and upload the screenshot to confirm your registration
            </p>
         </div>

         <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Section */}
            <div className="space-y-6">
               {/* UPI Configuration Warning (if applicable) */}
               {upiWarning && (
                  <Card className="border-yellow-200 bg-yellow-50">
                     <CardContent className="pt-6">
                        <div className="text-sm text-yellow-800">
                           <strong>Admin Notice:</strong> {upiWarning}
                        </div>
                     </CardContent>
                  </Card>
               )}

               {/* UPI QR Code */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-lg sm:text-xl">Make Payment</CardTitle>
                     <CardDescription>
                        Scan the QR code below with any UPI app to make the payment
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg border">
                           <Image
                              src={qrCodeUrl}
                              alt="UPI QR Code"
                              width={300}
                              height={300}
                              className="w-full max-w-[300px] h-auto"
                              loading="eager"
                              priority
                           />
                        </div>
                        
                        <div className="text-center space-y-2">
                           <div className="text-2xl font-bold text-primary">₹{event.price}</div>
                           <div className="text-sm text-muted-foreground">Registration Fee</div>
                           <div className="text-sm font-medium">UPI ID: {upiId}</div>
                        </div>
                        
                        <div className="text-center text-xs text-muted-foreground max-w-sm">
                           <p>• Open any UPI app (PhonePe, Google Pay, Paytm, etc.)</p>
                           <p>• Scan the QR code above</p>
                           <p>• Enter the amount ₹{event.price}</p>
                           <p>• Complete the payment</p>
                           <p>• Take a screenshot of the payment confirmation</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Payment Verification Form */}
               <CheckoutForm event={event} />
            </div>

            {/* Event Summary */}
            <div>
               <Card className="sticky top-8">
                  <CardHeader>
                     <CardTitle className="text-lg">Order Summary</CardTitle>
                     <CardDescription>
                        Review your registration details
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-3">
                        <div>
                           <h3 className="font-semibold text-lg">{event.title}</h3>
                           <p className="text-sm text-muted-foreground">
                              {event.category} Event
                           </p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                              <span>Event Date:</span>
                              <span className="font-medium">
                                 {new Date(event.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                 })}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span>Venue:</span>
                              <span className="font-medium">{event.venue}</span>
                           </div>
                           <div className="flex justify-between">
                              <span>Registration Fee:</span>
                              <span className="font-medium">₹{event.price}</span>
                           </div>
                        </div>

                        <div className="pt-3 border-t">
                           <div className="flex justify-between text-lg font-semibold">
                              <span>Total Amount:</span>
                              <span className="text-primary">₹{event.price}</span>
                           </div>
                        </div>
                        
                        <div className="pt-3 text-xs text-muted-foreground">
                           <p>• Payment confirmation required for registration</p>
                           <p>• Registration will be confirmed within 24 hours</p>
                           <p>• Refunds not available after confirmation</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   )
}
