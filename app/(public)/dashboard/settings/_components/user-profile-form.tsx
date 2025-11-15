"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, User, Mail, Phone, MessageCircle, IdCard, MapPin, Building } from "lucide-react";
import { updateUserProfileData, type UserProfileData } from "../actions";

interface UserProfileFormProps {
  initialData: {
    name: string;
    email: string;
    mobileNumber?: string | null;
    whatsappNumber?: string | null;
    aadhaarNumber?: string | null;
    state?: string | null;
    district?: string | null;
    collegeName?: string | null;
    collegeAddress?: string | null;
  };
}

export function UserProfileForm({ initialData }: UserProfileFormProps) {
  const [formData, setFormData] = useState<UserProfileData>({
    name: initialData.name || "",
    email: initialData.email || "",
    mobileNumber: initialData.mobileNumber || "",
    whatsappNumber: initialData.whatsappNumber || "",
    aadhaarNumber: initialData.aadhaarNumber || "",
    state: initialData.state || "",
    district: initialData.district || "",
    collegeName: initialData.collegeName || "",
    collegeAddress: initialData.collegeAddress || "",
  });

  const [pending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const result = await updateUserProfileData(formData);
        
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

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-sm">
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
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

              {/* Email */}
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

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number *
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  placeholder="+91 9876543210"
                  required
                  disabled={pending}
                />
              </div>

              {/* WhatsApp Number */}
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
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="aadhaarNumber" className="flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  Aadhaar Number *
                </Label>
                <Input
                  id="aadhaarNumber"
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange("aadhaarNumber", e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="123456789012"
                  required
                  disabled={pending}
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  12-digit Aadhaar number for identity verification
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            Location Information
          </CardTitle>
          <CardDescription className="text-sm">
            Your current location details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state" className="flex items-center gap-2 text-sm">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                State *
              </Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Enter your state"
                required
                disabled={pending}
                className="h-10 text-sm"
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district" className="flex items-center gap-2 text-sm">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                District *
              </Label>
              <Input
                id="district"
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="Enter your district"
                required
                disabled={pending}
                className="h-10 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
            Educational Information
          </CardTitle>
          <CardDescription className="text-sm">
            Your college and educational details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {/* College Name */}
            <div className="space-y-2">
              <Label htmlFor="collegeName" className="flex items-center gap-2 text-sm">
                <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                College Name *
              </Label>
              <Input
                id="collegeName"
                type="text"
                value={formData.collegeName}
                onChange={(e) => handleInputChange("collegeName", e.target.value)}
                placeholder="Enter your college name"
                required
                disabled={pending}
                className="h-10 text-sm"
              />
            </div>

            {/* College Address */}
            <div className="space-y-2">
              <Label htmlFor="collegeAddress" className="flex items-center gap-2 text-sm">
                <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                College Address *
              </Label>
              <Textarea
                id="collegeAddress"
                value={formData.collegeAddress}
                onChange={(e) => handleInputChange("collegeAddress", e.target.value)}
                placeholder="Enter your college address"
                required
                disabled={pending}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={pending} 
          className="w-full sm:w-auto min-w-40 h-10 text-sm"
          onClick={handleSubmit}
        >
          {pending ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-2" />
              Updating Profile...
            </>
          ) : (
            <>
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Update Profile
            </>
          )}
        </Button>
      </div>

      {/* Information Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              ℹ
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Profile Sync Information
              </h4>
              <p className="text-sm text-blue-700">
                When you update your profile here, all your event registrations, team memberships, 
                and join requests will be automatically updated with the new information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}