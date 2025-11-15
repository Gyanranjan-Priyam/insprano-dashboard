"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutSchemaType, ParticipationSchemaType } from "@/lib/zodSchema";
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
import { Loader2, UploadIcon, CheckCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { completeRegistrationAction } from "../action";

interface CheckoutFormProps {
  event: {
    id: string;
    title: string;
    category: string;
    price: number;
    date: Date;
    venue: string;
  };
}

export function CheckoutForm({ event }: CheckoutFormProps) {
  const [pending, startTransition] = useTransition();
  const [registrationData, setRegistrationData] = useState<ParticipationSchemaType | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CheckoutSchemaType>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentScreenshotKey: "",
      transactionId: "",
    },
  });

  // Load registration data from session storage
  useEffect(() => {
    const data = sessionStorage.getItem('registrationData');
    if (data) {
      try {
        const parsedData = JSON.parse(data) as ParticipationSchemaType;
        setRegistrationData(parsedData);
      } catch (error) {
        console.error('Failed to parse registration data:', error);
        toast.error("Registration data not found. Please start over.");
        router.push(`/dashboard/participate/${event.id}`);
      }
    } else {
      toast.error("Registration data not found. Please start over.");
      router.push(`/dashboard/participate/${event.id}`);
    }
  }, [event.id, router]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadLoading(true);
    try {
      // First get pre-signed URL from S3
      const preSignedResponse = await fetch('/api/s3/payment-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const preSignedResult = await preSignedResponse.json();

      if (!preSignedResponse.ok || preSignedResult.error) {
        throw new Error(preSignedResult.error || 'Failed to get upload URL');
      }

      // Upload file to S3 using pre-signed URL
      const uploadResponse = await fetch(preSignedResult.preSignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      form.setValue('paymentScreenshotKey', preSignedResult.key);
      setUploadedFile(file);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload screenshot. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  function onSubmit(values: CheckoutSchemaType) {
    if (!registrationData) {
      toast.error("Registration data not found. Please start over.");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        completeRegistrationAction(event.id, registrationData, values)
      );

      if (error) {
        toast.error("Error completing registration: " + error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        // Clear session storage
        sessionStorage.removeItem('registrationData');
        router.push("/dashboard/participate");
      } else {
        toast.error(result?.message || "Failed to complete registration");
      }
    });
  }

  if (!registrationData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Payment Verification</CardTitle>
        <CardDescription>
          Upload your payment screenshot and provide transaction details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Registration Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Registration Details:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Name:</strong> {registrationData.fullName}</p>
                <p><strong>Email:</strong> {registrationData.email}</p>
                <p><strong>Mobile:</strong> {registrationData.mobileNumber}</p>
                <p><strong>College:</strong> {registrationData.collegeName}</p>
              </div>
            </div>

            {/* Payment Screenshot Upload */}
            <FormField
              control={form.control}
              name="paymentScreenshotKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Payment Screenshot *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                        disabled={uploadLoading}
                      />
                      {uploadedFile && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          {uploadedFile.name} uploaded successfully
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction ID */}
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Transaction ID (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter UPI transaction ID if available" 
                      className="h-10 sm:h-11 text-sm sm:text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <Button 
                type="submit" 
                disabled={pending || uploadLoading || !form.getValues('paymentScreenshotKey')}
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing Registration...
                  </>
                ) : uploadLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading Screenshot...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
              
              {!form.getValues('paymentScreenshotKey') && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Please upload payment screenshot to continue
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}