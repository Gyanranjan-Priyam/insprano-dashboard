"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateUserProfile, UserProfile } from "../[userId]/actions";
import { ArrowRight, User, Phone, MapPin, Building } from "lucide-react";

interface UserDetailsFormProps {
  initialData: UserProfile | null;
  userId: string;
}

export function UserDetailsForm({ initialData, userId }: UserDetailsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    mobileNumber: initialData?.mobileNumber || "",
    whatsappNumber: initialData?.whatsappNumber || "",
    state: initialData?.state || "",
    district: initialData?.district || "",
    collegeName: initialData?.collegeName || "",
    collegeAddress: initialData?.collegeAddress || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ["name", "email", "mobileNumber", "state", "district", "collegeName", "collegeAddress"];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    // Mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error("Mobile number must be 10 digits");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber || undefined,
        state: formData.state,
        district: formData.district,
        collegeName: formData.collegeName,
        collegeAddress: formData.collegeAddress,
      });

      if (result.status === "success") {
        toast.success("Profile updated successfully");
        // Store form data in localStorage for next steps
        localStorage.setItem("accommodationBooking", JSON.stringify({
          userDetails: formData,
          step: "stay-selection"
        }));
        router.push(`/dashboard/accommodations/${userId}/stay-selection`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Details
        </CardTitle>
        <CardDescription>
          Please fill in your personal information. This will be used for your accommodation booking.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading || !!initialData?.email}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  placeholder="10-digit WhatsApp number"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter your state"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Enter your district"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* College Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" />
              College Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name *</Label>
                <Input
                  id="collegeName"
                  value={formData.collegeName}
                  onChange={(e) => handleInputChange("collegeName", e.target.value)}
                  placeholder="Enter your college name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collegeAddress">College Address *</Label>
                <Textarea
                  id="collegeAddress"
                  value={formData.collegeAddress}
                  onChange={(e) => handleInputChange("collegeAddress", e.target.value)}
                  placeholder="Enter your college full address"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isLoading} className="min-w-32">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Continue to Stay Selection
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}