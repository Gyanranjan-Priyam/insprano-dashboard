"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserPlus, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { createJoinRequestByCode } from "../../../actions";

interface UserProfile {
  name: string;
  email: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  aadhaarNumber?: string;
  state?: string;
  district?: string;
  collegeName?: string;
  collegeAddress?: string;
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

interface JoinTeamFormProps {
  teamCode: string;
  userId: string;
}

export function JoinTeamForm({ teamCode, userId }: JoinTeamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
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

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          
          // Prefill form with profile data
          setFormData(prev => ({
            ...prev,
            fullName: profile.name || '',
            email: profile.email || '',
            mobileNumber: profile.mobileNumber || '',
            whatsappNumber: profile.whatsappNumber || '',
            aadhaarNumber: profile.aadhaarNumber || '',
            state: profile.state || '',
            district: profile.district || '',
            collegeName: profile.collegeName || '',
            collegeAddress: profile.collegeAddress || '',
          }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFormChange = (field: keyof JoinRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'mobileNumber', 'aadhaarNumber', 'state', 'district', 'collegeName', 'collegeAddress'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof JoinRequestForm].trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }

    // Validate Aadhaar number (12 digits)
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(formData.aadhaarNumber)) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return false;
    }

    return true;
  };

  const handleSubmitRequest = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await createJoinRequestByCode({
        teamCode: teamCode,
        ...formData
      });

      if (result.status === 'success') {
        toast.success(result.message);
        router.push('/dashboard/teams');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to submit join request');
      console.error('Join request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToProfile = () => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.name || '',
        email: userProfile.email || '',
        mobileNumber: userProfile.mobileNumber || '',
        whatsappNumber: userProfile.whatsappNumber || '',
        aadhaarNumber: userProfile.aadhaarNumber || '',
        state: userProfile.state || '',
        district: userProfile.district || '',
        collegeName: userProfile.collegeName || '',
        collegeAddress: userProfile.collegeAddress || '',
      }));
      toast.success('Form reset to profile data');
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading Profile...
          </CardTitle>
          <CardDescription>
            We're fetching your profile information to prefill the form.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Personal Information Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-2 h-6 bg-blue-200 rounded-full animate-pulse"></div>
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Location Information Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-2 h-6 bg-green-200 rounded-full animate-pulse"></div>
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-36 sm:ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          Join Team Request
        </CardTitle>
        <CardDescription className="text-sm">
          Your profile information has been pre-filled. Review and update as needed before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleFormChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="h-10 mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="Enter your email"
                className="h-10 mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-medium">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => handleFormChange('mobileNumber', e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="h-10 mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-sm font-medium">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => handleFormChange('whatsappNumber', e.target.value)}
                placeholder="WhatsApp number (optional)"
                maxLength={10}
                className="h-10 mt-2"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="aadhaarNumber" className="text-sm font-medium">Aadhaar Number *</Label>
              <Input
                id="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={(e) => handleFormChange('aadhaarNumber', e.target.value)}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                className="h-10 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-2 h-6 bg-green-500 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Location Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleFormChange('state', e.target.value)}
                placeholder="Your state"
                className="h-10 mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleFormChange('district', e.target.value)}
                placeholder="Your district"
                className="h-10 mt-2"
              />
            </div>
          </div>
        </div>

        {/* College Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white">College Information</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collegeName" className="text-sm font-medium">College Name *</Label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) => handleFormChange('collegeName', e.target.value)}
                placeholder="Your college/institution name"
                className="h-10 mt-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collegeAddress" className="text-sm font-medium">College Address *</Label>
              <Textarea
                id="collegeAddress"
                value={formData.collegeAddress}
                onChange={(e) => handleFormChange('collegeAddress', e.target.value)}
                placeholder="Full college address"
                rows={3}
                className="resize-none mt-2"
              />
            </div>
          </div>
        </div>

        {/* Optional Message */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Message to Team Leader</h4>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleFormChange('message', e.target.value)}
              placeholder="Tell the team leader why you'd like to join their team..."
              rows={4}
              className="resize-none mt-2"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            disabled={isSubmitting}
            className="sm:w-auto sm:ml-auto order-1 sm:order-2 bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Join Request
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}