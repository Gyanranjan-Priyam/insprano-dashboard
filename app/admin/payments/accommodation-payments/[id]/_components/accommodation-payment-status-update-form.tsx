"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateAccommodationPaymentStatus, sendAccommodationConfirmationEmail } from "../../../actions";
import { CheckCircleIcon, MailIcon } from "lucide-react";

interface AccommodationPaymentStatusUpdateFormProps {
  bookingId: string;
  currentPaymentStatus: string;
  currentBookingStatus: string;
}

export function AccommodationPaymentStatusUpdateForm({ 
  bookingId, 
  currentPaymentStatus,
  currentBookingStatus 
}: AccommodationPaymentStatusUpdateFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<string>(currentPaymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const router = useRouter();

  const handleStatusUpdate = async () => {
    if (paymentStatus === currentPaymentStatus) {
      toast.info("No changes to update");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateAccommodationPaymentStatus(
        bookingId, 
        paymentStatus as "VERIFIED" | "PENDING" | "FAILED"
      );
      
      if (result.success) {
        toast.success("Payment status updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendConfirmationEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await sendAccommodationConfirmationEmail(bookingId);
      
      if (result.success) {
        toast.success("Confirmation email sent successfully!");
      } else {
        toast.error(result.error || "Failed to send confirmation email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send confirmation email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Update Status</CardTitle>
        <CardDescription className="text-sm">
          Change payment status and send notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Payment Status</label>
          <Badge className={`${getStatusColor(currentPaymentStatus)} w-fit text-xs ml-3`}>
            {currentPaymentStatus}
          </Badge>
        </div>

        {/* Status Update */}
        <div className="space-y-2">
          <label className="text-sm font-medium mb-2">Update Payment Status</label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="VERIFIED">VERIFIED</SelectItem>
              <SelectItem value="FAILED">FAILED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Update Button */}
        <Button 
          onClick={handleStatusUpdate}
          disabled={isUpdating || paymentStatus === currentPaymentStatus}
          className="w-full"
          size="sm"
        >
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>

        {/* Send Confirmation Email */}
        {paymentStatus === "VERIFIED" && (
          <Button 
            onClick={handleSendConfirmationEmail}
            disabled={isSendingEmail}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <MailIcon className="w-4 h-4 mr-2" />
            {isSendingEmail ? "Sending..." : "Send Confirmation Email"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}