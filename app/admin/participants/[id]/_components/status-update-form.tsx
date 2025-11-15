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
import { updateParticipantStatus } from "../../action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface StatusUpdateFormProps {
  participationId: string;
  currentStatus: string;
}

export function StatusUpdateForm({ participationId, currentStatus }: StatusUpdateFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      toast.error("Please select a different status");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateParticipantStatus(participationId, selectedStatus));
      if (error) {
        toast.error("Error updating status: " + error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        setSelectedStatus("");
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-xs md:text-sm font-medium">Update Status</label>
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