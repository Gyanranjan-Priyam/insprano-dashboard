"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, CalendarIcon, MapPinIcon, TagIcon, UserIcon, PhoneIcon, MailIcon, IdCardIcon, MapIcon, SchoolIcon, FileImageIcon, Loader2 } from "lucide-react";
import { getParticipantById, updateParticipantStatus } from "../action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect } from "react";

interface ParticipantDetailsDialogProps {
  participationId: string;
  participantName: string;
  onStatusUpdate?: () => void;
}

export function ParticipantDetailsDialog({ 
  participationId, 
  participantName,
  onStatusUpdate 
}: ParticipantDetailsDialogProps) {
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const loadParticipantDetails = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await tryCatch(getParticipantById(participationId));
      if (error || !result || result.status === "error") {
        toast.error("Failed to load participant details");
        return;
      }
      setParticipant(result.data);
    } catch (error) {
      toast.error("Failed to load participant details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadParticipantDetails();
    }
  }, [open, participationId]);

  const handleStatusUpdate = (newStatus: string) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateParticipantStatus(participationId, newStatus));
      if (error) {
        toast.error("Error updating status: " + error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        setParticipant((prev: any) => ({ ...prev, status: newStatus }));
        onStatusUpdate?.();
      } else {
        toast.error(result?.message || "Failed to update status");
      }
    });
  };

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs md:text-sm">
          <EyeIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
          <span className="hidden sm:inline">View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg md:text-xl">Participant Details</DialogTitle>
          <DialogDescription className="text-sm">
            Complete information for {participantName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 md:py-12">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
          </div>
        ) : participant ? (
          <div className="space-y-4 md:space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <Avatar className="w-12 h-12 md:w-16 md:h-16 shrink-0">
                    <AvatarImage src={participant.user.image || ""} />
                    <AvatarFallback>
                      {participant.user.name?.charAt(0) || participant.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold truncate">{participant.fullName}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{participant.user.email}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      User since {format(new Date(participant.user.createdAt), "MMMM yyyy")}
                    </p>
                    <Badge className={`${getStatusColor(participant.status)} text-xs mt-2`}>
                      {participant.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <MailIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs md:text-sm truncate">{participant.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs md:text-sm">{participant.mobileNumber}</span>
                  </div>
                  {participant.whatsappNumber && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs md:text-sm">WhatsApp: {participant.whatsappNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 min-w-0">
                    <IdCardIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs md:text-sm truncate">Aadhaar: {participant.aadhaarNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium">State</label>
                    <p className="text-xs md:text-sm text-muted-foreground">{participant.state}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium">District</label>
                    <p className="text-xs md:text-sm text-muted-foreground">{participant.district}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* College Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <SchoolIcon className="w-4 h-4 md:w-5 md:h-5" />
                  College Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs md:text-sm font-medium">College Name</label>
                    <p className="text-xs md:text-sm text-muted-foreground">{participant.collegeName}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium">College Address</label>
                    <p className="text-xs md:text-sm text-muted-foreground wrap-break-word">{participant.collegeAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="font-semibold text-sm md:text-base">{participant.event.title}</h3>
                    <Badge variant="secondary" className="w-fit text-xs">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {participant.event.category}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{format(new Date(participant.event.date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{participant.event.venue}</span>
                    </div>
                  </div>
                  <div className="text-base md:text-lg font-semibold bg-muted/30 p-3 rounded-lg">
                    Registration Fee: ₹{participant.event.price}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration & Payment Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Registration & Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="font-medium text-xs md:text-sm">Status:</span>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge className={`${getStatusColor(participant.status)} text-xs`}>
                        {participant.status.replace('_', ' ')}
                      </Badge>
                      <Select onValueChange={handleStatusUpdate} disabled={pending}>
                        <SelectTrigger className="w-full sm:w-40 text-xs md:text-sm">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REGISTERED">Registered</SelectItem>
                          <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                          <SelectItem value="PAYMENT_SUBMITTED">Payment Submitted</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <label className="font-medium">Registered At:</label>
                      <p className="text-muted-foreground wrap-break-word">
                        {format(new Date(participant.registeredAt), "PPP 'at' p")}
                      </p>
                    </div>
                    {participant.paymentSubmittedAt && (
                      <div>
                        <label className="font-medium">Payment Submitted:</label>
                        <p className="text-muted-foreground wrap-break-word">
                          {format(new Date(participant.paymentSubmittedAt), "PPP 'at' p")}
                        </p>
                      </div>
                    )}
                    {participant.paymentVerifiedAt && (
                      <div>
                        <label className="font-medium">Payment Verified:</label>
                        <p className="text-muted-foreground wrap-break-word">
                          {format(new Date(participant.paymentVerifiedAt), "PPP 'at' p")}
                        </p>
                      </div>
                    )}
                    {participant.paymentAmount && (
                      <div>
                        <label className="font-medium">Payment Amount:</label>
                        <p className="text-muted-foreground">₹{participant.paymentAmount}</p>
                      </div>
                    )}
                    {participant.transactionId && (
                      <div className="sm:col-span-2">
                        <label className="font-medium">Transaction ID:</label>
                        <p className="text-muted-foreground wrap-break-word">{participant.transactionId}</p>
                      </div>
                    )}
                  </div>

                  {participant.paymentScreenshotKey && (
                    <div>
                      <label className="font-medium text-xs md:text-sm">Payment Screenshot:</label>
                      <div className="mt-2">
                        <img
                          src={`/uploads/payments/${participant.paymentScreenshotKey}`}
                          alt="Payment Screenshot"
                          className="w-full max-w-sm rounded-lg border"
                        />
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 wrap-break-word">
                          File: {participant.paymentScreenshotKey}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm md:text-base">Failed to load participant details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}