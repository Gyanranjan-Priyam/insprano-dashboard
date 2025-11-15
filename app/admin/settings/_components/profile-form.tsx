"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, User, Mail, Phone, MessageCircle, CreditCard } from "lucide-react";
import { updateUserProfile, type ProfileUpdateData } from "../actions";

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    mobileNumber?: string | null;
    whatsappNumber?: string | null;
    upiId?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: initialData.name || "",
    email: initialData.email || "",
    mobileNumber: initialData.mobileNumber || "",
    whatsappNumber: initialData.whatsappNumber || "",
    upiId: initialData.upiId || "",
  });

  const [pending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const result = await updateUserProfile(formData);
        
        if (result.status === "success") {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={pending}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={pending}
            />
          </div>

          {/* Mobile Number Field */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile Number
            </Label>
            <Input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              placeholder="+91 9876543210"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +91 for India)
            </p>
          </div>

          {/* WhatsApp Number Field */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp Number
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
              placeholder="+91 9876543210"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              WhatsApp number for notifications and updates
            </p>
          </div>

          {/* UPI ID Field */}
          <div className="space-y-2">
            <Label htmlFor="upiId" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              UPI ID
            </Label>
            <Input
              id="upiId"
              type="text"
              value={formData.upiId}
              onChange={(e) => handleInputChange("upiId", e.target.value)}
              placeholder="yourname@paytm, yourname@ybl"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              UPI ID for payment settlements and transactions
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}