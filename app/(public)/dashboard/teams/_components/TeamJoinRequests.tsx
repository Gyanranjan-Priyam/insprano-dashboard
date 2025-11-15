"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  MessageSquare,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { getTeamJoinRequests, respondToJoinRequest } from "../actions";
import { useRouter } from "next/navigation";

interface JoinRequest {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber?: string | null;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  message?: string | null;
  requestedAt: Date;
  participant: {
    user: {
      name?: string | null;
      email: string;
    };
  };
}

interface TeamJoinRequestsProps {
  teamSlugId: string;
}

export function TeamJoinRequests({ teamSlugId }: TeamJoinRequestsProps) {
  const router = useRouter();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const fetchJoinRequests = async () => {
    setIsLoading(true);
    try {
      const result = await getTeamJoinRequests(teamSlugId);
      if (result.status === "success") {
        setJoinRequests(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to fetch join requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJoinRequests();
  }, [teamSlugId]);

  const handleRequestResponse = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    setProcessingRequest(requestId);
    try {
      const result = await respondToJoinRequest(requestId, action);
      if (result.status === "success") {
        toast.success(result.message);
        await fetchJoinRequests(); // Refresh the list
        router.refresh(); // Refresh the page to update team member count
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to process request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Loading join requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Requests
          </div>
          {joinRequests.length > 0 && (
            <Badge variant="secondary">
              {joinRequests.length} pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Review and manage team join requests from participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        {joinRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending join requests</p>
            <p className="text-xs mt-1">New requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 space-y-4 hover:bg-muted/30 transition-colors"
              >
                {/* Header with applicant info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(request.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{request.fullName}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Requested {formatDate(request.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{request.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{request.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{request.collegeName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{request.state}, {request.district}</span>
                  </div>
                </div>

                {/* Message preview */}
                {request.message && (
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Message:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.message.length > 100 
                        ? `${request.message.substring(0, 100)}...` 
                        : request.message
                      }
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 justify-between">
                  {/* View Details Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Join Request Details</DialogTitle>
                        <DialogDescription>
                          Full information provided by {request.fullName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h4 className="font-medium mb-3">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Full Name:</span>
                              <p>{request.fullName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>
                              <p>{request.email}</p>
                            </div>
                            <div>
                              <span className="font-medium">Mobile:</span>
                              <p>{request.mobileNumber}</p>
                            </div>
                            {request.whatsappNumber && (
                              <div>
                                <span className="font-medium">WhatsApp:</span>
                                <p>{request.whatsappNumber}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Aadhaar:</span>
                              <p className="font-mono">{request.aadhaarNumber}</p>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <h4 className="font-medium mb-3">Location</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">State:</span>
                              <p>{request.state}</p>
                            </div>
                            <div>
                              <span className="font-medium">District:</span>
                              <p>{request.district}</p>
                            </div>
                          </div>
                        </div>

                        {/* College Information */}
                        <div>
                          <h4 className="font-medium mb-3">College Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">College Name:</span>
                              <p>{request.collegeName}</p>
                            </div>
                            <div>
                              <span className="font-medium">College Address:</span>
                              <p className="whitespace-pre-wrap">{request.collegeAddress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        {request.message && (
                          <div>
                            <h4 className="font-medium mb-3">Message</h4>
                            <div className="bg-muted/50 rounded-md p-3">
                              <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequestResponse(request.id, "REJECTED")}
                      disabled={processingRequest === request.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRequestResponse(request.id, "APPROVED")}
                      disabled={processingRequest === request.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {processingRequest === request.id ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}