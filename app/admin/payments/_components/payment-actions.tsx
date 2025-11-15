"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  EyeIcon, 
  MailIcon, 
  MoreHorizontalIcon
} from "lucide-react";
import { sendConfirmationEmail } from "../actions";
import { toast } from "sonner";
import Link from "next/link";

interface PaymentActionsProps {
  payment: any;
  onUpdate?: () => void;
}

export function PaymentActions({ payment, onUpdate }: PaymentActionsProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await sendConfirmationEmail(payment.id);
      if (result.success) {
        toast.success("Confirmation email sent successfully");
      } else {
        toast.error(result.error || "Failed to send email");
      }
    } catch (error) {
      toast.error("An error occurred while sending email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-6 h-6 md:w-8 md:h-8 p-0">
          <MoreHorizontalIcon className="w-3 h-3 md:w-4 md:h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/admin/payments/team-payments/${payment.id}`} className="text-xs md:text-sm">
            <EyeIcon className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          className="text-xs md:text-sm"
        >
          <MailIcon className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          {isSendingEmail ? "Sending..." : "Send Confirmation Email"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}