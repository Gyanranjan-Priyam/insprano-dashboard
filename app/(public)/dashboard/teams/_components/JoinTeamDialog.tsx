"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Calendar, MapPin, Users, Crown, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";

interface TeamInfo {
  id: string;
  name: string;
  description?: string;
  teamCode: string;
  maxMembers: number;
  currentMembers: number;
  event: {
    id: string;
    title: string;
    date: Date;
    venue?: string;
  };
  leader: {
    fullName: string;
    email: string;
  };
}

interface JoinTeamDialogProps {
  teamInfo: TeamInfo;
  trigger?: React.ReactNode;
  onJoinRequest?: (requestData: any) => Promise<{ status: string; message: string }>;
}

interface JoinRequestForm {
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  aadhaarNumber: string;
  state: string;
  district: string;
  collegeName: string;
  collegeAddress: string;
  message: string;
}

const parseContent = (content: any) => {
  // If content is null or undefined, return empty doc
  if (!content) {
    return {
      type: 'doc',
      content: []
    };
  }

  // If content is already an object (parsed JSON), return it directly
  if (typeof content === 'object' && content !== null) {
    return content;
  }
  
  // If content is a string, first try to parse it as JSON
  if (typeof content === 'string') {
    // Check if it looks like JSON (starts with { and ends with })
    const trimmed = content.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        // Verify it's a proper TipTap JSON structure
        if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
          return parsed;
        }
      } catch (error) {
        // If parsing fails, treat as plain text below
      }
    }

    // If it's not JSON or parsing failed, treat as plain text
    // Convert plain text to TipTap JSON structure
    const paragraphs = content.split('\n').filter(line => line.trim() !== '');
    
    if (paragraphs.length === 0) {
      return {
        type: 'doc',
        content: []
      };
    }

    return {
      type: 'doc',
      content: paragraphs.map(paragraph => ({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: paragraph.trim()
          }
        ]
      }))
    };
  }
  
  // Fallback for other types
  return {
    type: 'doc',
    content: []
  };
};

export function JoinTeamDialog({ teamInfo, trigger, onJoinRequest }: JoinTeamDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'confirm' | 'form'>('confirm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<JoinRequestForm>({
    fullName: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    aadhaarNumber: '',
    state: '',
    district: '',
    collegeName: '',
    collegeAddress: '',
    message: ''
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleConfirm = () => {
    setStep('form');
  };

  const handleFormChange = (field: keyof JoinRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequest = async () => {
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'mobileNumber', 'aadhaarNumber', 'state', 'district', 'collegeName', 'collegeAddress'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof JoinRequestForm].trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate Aadhaar number (12 digits)
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(formData.aadhaarNumber)) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onJoinRequest) {
        const result = await onJoinRequest({
          teamId: teamInfo.id,
          teamCode: teamInfo.teamCode,
          ...formData
        });

        if (result.status === 'success') {
          toast.success(result.message);
          setOpen(false);
          setStep('confirm');
          setFormData({
            fullName: '',
            email: '',
            mobileNumber: '',
            whatsappNumber: '',
            aadhaarNumber: '',
            state: '',
            district: '',
            collegeName: '',
            collegeAddress: '',
            message: ''
          });
          router.refresh();
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Failed to submit join request');
      console.error('Join request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setStep('confirm');
    setFormData({
      fullName: '',
      email: '',
      mobileNumber: '',
      whatsappNumber: '',
      aadhaarNumber: '',
      state: '',
      district: '',
      collegeName: '',
      collegeAddress: '',
      message: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Join Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-4">
        {step === 'confirm' ? (
          <>
            <DialogHeader className="px-2 sm:px-0">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                Join Team Request
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Review the team details before proceeding with your join request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
              {/* Team Information Card */}
              <Card>
                <CardHeader className="px-3 sm:px-6">
                  <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                    <span className="truncate">{teamInfo.name}</span>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {teamInfo.currentMembers}/{teamInfo.maxMembers} Members
                    </Badge>
                  </CardTitle>
                  {teamInfo.description && (
                    <CardDescription className="text-xs sm:text-sm">
                      <RenderDescription json={parseContent(teamInfo.description)} />
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                  {/* Team Leader */}
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{teamInfo.leader.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{teamInfo.leader.email}</p>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs sm:text-sm">Event Details</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{teamInfo.event.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs sm:text-sm">{formatDate(teamInfo.event.date)}</span>
                      </div>
                      {teamInfo.event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{teamInfo.event.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Capacity */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span>
                      {teamInfo.maxMembers - teamInfo.currentMembers} slot{teamInfo.maxMembers - teamInfo.currentMembers !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={handleCancel} className="h-9 sm:h-10 text-sm">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} className="h-9 sm:h-10 text-sm">
                  Proceed to Application
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-2 sm:px-0">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                Complete Your Application
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Fill in your details to send a join request to the team leader
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
              {/* Form */}
              <div className="space-y-3 sm:space-y-4">
                {/* Personal Information */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleFormChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber" className="text-sm">Mobile Number *</Label>
                      <Input
                        id="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(e) => handleFormChange('mobileNumber', e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber" className="text-sm">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={(e) => handleFormChange('whatsappNumber', e.target.value)}
                        placeholder="WhatsApp number (optional)"
                        maxLength={10}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="aadhaarNumber" className="text-sm">Aadhaar Number *</Label>
                      <Input
                        id="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={(e) => handleFormChange('aadhaarNumber', e.target.value)}
                        placeholder="12-digit Aadhaar number"
                        maxLength={12}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Location Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleFormChange('state', e.target.value)}
                        placeholder="Your state"
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm">District *</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleFormChange('district', e.target.value)}
                        placeholder="Your district"
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* College Information */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">College Information</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="collegeName" className="text-sm">College Name *</Label>
                      <Input
                        id="collegeName"
                        value={formData.collegeName}
                        onChange={(e) => handleFormChange('collegeName', e.target.value)}
                        placeholder="Your college/institution name"
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collegeAddress" className="text-sm">College Address *</Label>
                      <Textarea
                        id="collegeAddress"
                        value={formData.collegeAddress}
                        onChange={(e) => handleFormChange('collegeAddress', e.target.value)}
                        placeholder="Full college address"
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Message to Team Leader (Optional)</h4>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Your Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      placeholder="Tell the team leader why you'd like to join their team..."
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setStep('confirm')} className="h-9 sm:h-10 text-sm">
                  Back
                </Button>
                <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="h-9 sm:h-10 text-sm">
                  {isSubmitting ? 'Submitting...' : 'Send Join Request'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}