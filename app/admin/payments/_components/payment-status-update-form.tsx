"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePaymentStatus } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentStatusUpdateFormProps {
  participationId: string;
  currentStatus: string;
  onUpdate?: () => void;
}

export function PaymentStatusUpdateForm({ participationId, currentStatus, onUpdate }: PaymentStatusUpdateFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      toast.error("Please select a different status");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updatePaymentStatus(participationId, selectedStatus as any);
        
        if (result.success) {
          toast.success(`Payment status updated to ${selectedStatus.replace('_', ' ')}`);
          setSelectedStatus("");
          
          // Use router.refresh() for server component pages or callback for client components
          if (onUpdate) {
            onUpdate();
          } else {
            router.refresh();
          }
        } else {
          toast.error(result.error || "Failed to update status");
        }
      } catch (error) {
        toast.error("An error occurred while updating status");
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-xs md:text-sm font-medium">Update Payment Status</label>
      <Select onValueChange={setSelectedStatus} value={selectedStatus}>
        <SelectTrigger className="text-xs md:text-sm">
          <SelectValue placeholder="Select new status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="REGISTERED">Registered</SelectItem>
          <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
          <SelectItem value="PAYMENT_SUBMITTED">Payment Submitted</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        onClick={handleStatusUpdate} 
        disabled={pending || !selectedStatus || selectedStatus === currentStatus}
        className="w-full text-xs md:text-sm"
      >
        {pending ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin mr-2" />
        ) : null}
        Update Status
      </Button>
    </div>
  );
}