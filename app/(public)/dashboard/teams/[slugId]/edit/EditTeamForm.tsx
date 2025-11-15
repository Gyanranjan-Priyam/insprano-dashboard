"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, UserPlus, Crown, Users, Settings, Save, Upload, Camera, Copy, RefreshCw } from "lucide-react";
import { updateTeam, addTeamMember, removeTeamMember, transferTeamLeadership, addTeamMemberWithProfile, generateNewTeamCode, deleteTeam } from "../../actions";

interface TeamMember {
  id: string;
  participant: {
    id: string;
    fullName: string;
    email: string;
    user: {
      name: string | null;
    } | null;
  };
}

interface PotentialMember {
  id: string;
  fullName: string;
  email: string;
  user: {
    name: string | null;
  } | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  slugId: string | null;
  teamCode: string | null;
  maxMembers: number;
  isPublic: boolean;
  event: {
    id: string;
    title: string;
  };
  leader: {
    userId: string;
  };
}

interface EditTeamFormProps {
  team: Team;
  currentMembers: TeamMember[];
  potentialMembers: PotentialMember[];
}

export default function EditTeamForm({ team, currentMembers, potentialMembers }: EditTeamFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [selectedPotentialMember, setSelectedPotentialMember] = useState<string>("");
  
  // Team settings state
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [isPublic, setIsPublic] = useState(team.isPublic);
  const [teamCode, setTeamCode] = useState(team.teamCode || "");

  // New member form state
  const [newMemberData, setNewMemberData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    whatsappNumber: "",
    aadhaarNumber: "",
    collegeName: "",
    collegeAddress: "",
    state: "",
    district: "",
    pinCode: "",
    profileImage: null as File | null
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Delhi", "Puducherry", "Chandigarh", "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Ladakh", "Jammu and Kashmir"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMemberData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetMemberForm = () => {
    setNewMemberData({
      fullName: "",
      email: "",
      mobileNumber: "",
      whatsappNumber: "",
      aadhaarNumber: "",
      collegeName: "",
      collegeAddress: "",
      state: "",
      district: "",
      pinCode: "",
      profileImage: null
    });
    setProfileImagePreview(null);
  };

  // Individual field handlers
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleTeamDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handlePublicChange = (checked: boolean) => {
    setIsPublic(checked);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, fullName: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, email: e.target.value }));
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, mobileNumber: e.target.value }));
  };

  const handleWhatsappNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, whatsappNumber: e.target.value }));
  };

  const handleAadhaarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, aadhaarNumber: e.target.value }));
  };

  const handleCollegeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, collegeName: e.target.value }));
  };

  const handleCollegeAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMemberData(prev => ({ ...prev, collegeAddress: e.target.value }));
  };

  const handleStateChange = (value: string) => {
    setNewMemberData(prev => ({ ...prev, state: value }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, district: e.target.value }));
  };

  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberData(prev => ({ ...prev, pinCode: e.target.value }));
  };

  const handleProfileImageClick = () => {
    document.getElementById('profile-image')?.click();
  };

  const handleBackNavigation = () => {
    router.push(team.slugId ? `/dashboard/teams/${team.slugId}` : "/dashboard/teams");
  };

  const createTransferHandler = (memberId: string, memberName: string) => {
    return () => handleTransferLeadership(memberId, memberName);
  };

  const createRemoveHandler = (memberId: string, memberName: string) => {
    return () => handleRemoveMember(memberId, memberName);
  };

  const handleGenerateTeamCode = async () => {
    if (!team.slugId) return;
    
    setIsGeneratingCode(true);
    try {
      const result = await generateNewTeamCode(team.slugId);
      
      if (result.status === "success") {
        setTeamCode(result.data?.teamCode || "");
        toast.success("Team code generated successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to generate team code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyTeamCode = async () => {
    if (teamCode) {
      try {
        await navigator.clipboard.writeText(teamCode);
        toast.success("Team code copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy team code");
      }
    }
  };

  const handleUpdateTeam = async () => {
    if (!team.slugId) {
      toast.error("Team slug not found");
      return;
    }
    
    setIsUpdating(true);
    try {
      const result = await updateTeam(team.slugId, {
        name: name !== team.name ? name : undefined,
        description: description !== (team.description || "") ? description : undefined,
        isPublic: isPublic !== team.isPublic ? isPublic : undefined,
      });

      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update team");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNewMember = async () => {
    if (!team.slugId || !newMemberData.fullName || !newMemberData.email) {
      toast.error("Please fill in required fields (Name and Email)");
      return;
    }

    setIsAddingMember(true);
    try {
      // TODO: Upload image to S3 and get the key if profileImage exists
      let profileImageKey: string | undefined;
      if (newMemberData.profileImage) {
        // Image upload logic would go here
        // profileImageKey = await uploadImageToS3(newMemberData.profileImage);
      }

      const result = await addTeamMemberWithProfile(team.slugId, {
        fullName: newMemberData.fullName,
        email: newMemberData.email,
        mobileNumber: newMemberData.mobileNumber || undefined,
        whatsappNumber: newMemberData.whatsappNumber || undefined,
        aadhaarNumber: newMemberData.aadhaarNumber || undefined,
        collegeName: newMemberData.collegeName || undefined,
        collegeAddress: newMemberData.collegeAddress || undefined,
        state: newMemberData.state || undefined,
        district: newMemberData.district || undefined,
        pinCode: newMemberData.pinCode || undefined,
        profileImageKey
      });
      
      if (result.status === "success") {
        toast.success("Member added successfully!");
        resetMemberForm();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedPotentialMember || !team.slugId) return;
    
    const member = potentialMembers.find(m => m.id === selectedPotentialMember);
    if (!member) return;

    setIsAddingMember(true);
    try {
      const result = await addTeamMember(team.slugId, member.email);
      
      if (result.status === "success") {
        toast.success(result.message);
        setSelectedPotentialMember("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!team.slugId) return;
    
    try {
      const result = await removeTeamMember(team.slugId, memberId);
      
      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleTransferLeadership = async (newLeaderId: string, newLeaderName: string) => {
    if (!team.slugId) return;
    
    try {
      const result = await transferTeamLeadership(team.slugId, newLeaderId);
      
      if (result.status === "success") {
        toast.success(result.message);
        router.push(team.slugId ? `/dashboard/teams/${team.slugId}` : "/dashboard/teams");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to transfer leadership");
    }
  };

  const handleDeleteTeam = async () => {
    if (!team.slugId) return;
    
    setIsDeletingTeam(true);
    try {
      const result = await deleteTeam(team.slugId);
      
      if (result.status === "success") {
        toast.success(result.message);
        router.push("/dashboard/teams");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete team");
    } finally {
      setIsDeletingTeam(false);
    }
  };

  const hasChanges = 
    name !== team.name ||
    description !== (team.description || "") ||
    isPublic !== team.isPublic;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen">
      {/* Left Side - Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Add New Member Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Team Member
            </CardTitle>
            <CardDescription>
              Add a new member to your team with complete profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newMemberData.fullName}
                    onChange={handleFullNameChange}
                    placeholder="Enter full name"
                    required
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMemberData.email}
                    onChange={handleEmailChange}
                    placeholder="Enter email address"
                    required
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={newMemberData.mobileNumber}
                    onChange={handleMobileNumberChange}
                    placeholder="Enter mobile number"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    value={newMemberData.whatsappNumber}
                    onChange={handleWhatsappNumberChange}
                    placeholder="Enter WhatsApp number"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    value={newMemberData.aadhaarNumber}
                    onChange={handleAadhaarNumberChange}
                    placeholder="Enter Aadhaar number"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* College Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">College Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    value={newMemberData.collegeName}
                    onChange={handleCollegeNameChange}
                    placeholder="Enter college name"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="collegeAddress">College Address</Label>
                  <Textarea
                    id="collegeAddress"
                    value={newMemberData.collegeAddress}
                    onChange={handleCollegeAddressChange}
                    placeholder="Enter college address"
                    className="mt-2"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={newMemberData.state} onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={newMemberData.district}
                    onChange={handleDistrictChange}
                    placeholder="Enter district"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    value={newMemberData.pinCode}
                    onChange={handlePinCodeChange}
                    placeholder="Enter PIN code"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleAddNewMember}
                disabled={isAddingMember || !newMemberData.fullName || !newMemberData.email}
                className="flex-1"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isAddingMember ? "Adding Member..." : "Add Member"}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetMemberForm}
                disabled={isAddingMember}
              >
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Fixed Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          {/* Team Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Team Settings
              </CardTitle>
              <CardDescription>
                Manage your team configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={name}
                  onChange={handleTeamNameChange}
                  placeholder="Enter team name"
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={description}
                  onChange={handleTeamDescriptionChange}
                  placeholder="Describe your team..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="teamPublic"
                  checked={isPublic}
                  onCheckedChange={handlePublicChange}
                />
                <Label htmlFor="teamPublic">Public Team</Label>
              </div>

              {/* Team Code Section */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Team Join Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTeamCode}
                    disabled={isGeneratingCode}
                    className="h-7 px-2 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                    {teamCode ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>
                
                {teamCode ? (
                  <div className="relative">
                    <Input
                      value={teamCode}
                      readOnly
                      className="pr-8 font-mono text-center tracking-wider"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTeamCode}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Generate a code to let others join your team easily
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleUpdateTeam}
                  disabled={!hasChanges || isUpdating}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
          <Card className="border-red-200/10 mt-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200/10 rounded-lg bg-black-50/10">
                  <h4 className="font-semibold text-red-800 mb-2">Delete Team</h4>
                  <p className="text-sm text-red-700 mb-4">
                    This will permanently delete the team, all member data, and any pending join requests. 
                    This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isDeletingTeam}
                        className="cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeletingTeam ? "Deleting..." : "Delete Team"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the team{" "}
                          <span className="font-semibold">"{team.name}"</span> and remove all members, 
                          join requests, and team data from the system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingTeam}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteTeam}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeletingTeam}
                        >
                          {isDeletingTeam ? "Deleting..." : "Yes, delete team"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
            </CardContent>
          </Card>

          {/* Current Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({currentMembers.length}/{team.maxMembers})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentMembers.length > 0 ? (
                currentMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {(member.participant.user?.name || member.participant.fullName)
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.participant.user?.name || member.participant.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.participant.email}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Member
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Leader
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Transfer Leadership</AlertDialogTitle>
                            <AlertDialogDescription>
                              Transfer leadership to {member.participant.user?.name || member.participant.fullName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={createTransferHandler(member.participant.id, member.participant.user?.name || member.participant.fullName)}
                            >
                              Transfer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 text-xs text-red-600">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member Completely</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>
                                Are you sure you want to remove <span className="font-semibold">{member.participant.user?.name || member.participant.fullName}</span> from the team?
                              </p>
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                                <p className="font-medium text-yellow-800 mb-1">⚠️ Complete Removal</p>
                                <p className="text-yellow-700">
                                  This will permanently remove:
                                </p>
                                <ul className="text-yellow-700 text-xs mt-1 ml-4 list-disc space-y-1">
                                  <li>Team membership</li>
                                  <li>Event participation and payment status</li>
                                  <li>User account (if they have no other event participations)</li>
                                </ul>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> This action cannot be undone.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={createRemoveHandler(member.participant.id, member.participant.user?.name || member.participant.fullName)}
                            >
                              Remove Completely
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  No team members yet
                </p>
              )}

              {currentMembers.length >= team.maxMembers && (
                <div className="text-center text-xs text-muted-foreground py-2 border rounded bg-muted/50">
                  Team at maximum capacity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}