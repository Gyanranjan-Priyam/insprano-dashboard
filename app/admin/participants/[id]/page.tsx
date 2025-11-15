import { getParticipantById } from "../action";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarIcon, 
  MapPinIcon, 
  TagIcon, 
  UserIcon, 
  PhoneIcon, 
  MailIcon, 
  IdCardIcon, 
  MapIcon, 
  SchoolIcon, 
  UsersIcon,
  CrownIcon} from "lucide-react";
import { format } from "date-fns";
import PrintButton from "./_components/print-button";

interface ParticipantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParticipantDetailPage({ params }: ParticipantDetailPageProps) {
  const { id } = await params;
  const result = await getParticipantById(id);

  if (result.status === "error") {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Participant Details</h1>
          <div className="text-red-600 text-sm md:text-base">{result.message}</div>
        </div>
      </div>
    );
  }

  const participant = result.data;
  
  if (!participant) {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Participant Details</h1>
          <div className="text-red-600 text-sm md:text-base">Participant not found</div>
        </div>
      </div>
    );
  }

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
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">Participant Details</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Complete information for {participant.fullName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(participant.status)} shrink-0 text-xs md:text-sm`}>
            {participant.status.replace('_', ' ')}
          </Badge>
          <PrintButton 
            participantName={participant.fullName} 
            participantData={participant}
          />
        </div>
      </div>

      <div className="print-content">
        {/* Print-only header */}
        <div className="hidden print:block print-section">
          <div className="print-header">
            <h1>Participant Details Report</h1>
            <p>Participant: {participant.fullName}</p>
            <div className="print-status-badge">
              Status: {participant.status.replace('_', ' ')}
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* User Information */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
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
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <MailIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs md:text-sm truncate print-value">{participant.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs md:text-sm print-value">{participant.mobileNumber}</span>
                </div>
                {participant.whatsappNumber && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs md:text-sm print-value">WhatsApp: {participant.whatsappNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <IdCardIcon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs md:text-sm truncate print-value">Aadhaar: {participant.aadhaarNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 print-grid">
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">State</label>
                  <p className="text-xs md:text-sm text-muted-foreground print-value">{participant.state}</p>
                </div>
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">District</label>
                  <p className="text-xs md:text-sm text-muted-foreground print-value">{participant.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Information */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <SchoolIcon className="w-4 h-4 md:w-5 md:h-5" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">College Name</label>
                  <p className="text-xs md:text-sm text-muted-foreground print-value">{participant.collegeName}</p>
                </div>
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">College Address</label>
                  <p className="text-xs md:text-sm text-muted-foreground wrap-break-word print-value">{participant.collegeAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
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

          {/* Team Information */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participant.teamLeader && participant.teamLeader.length > 0 ? (
                <div className="space-y-4">
                  {participant.teamLeader.map((team) => (
                    <div key={team.id} className="border rounded-lg p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CrownIcon className="w-4 h-4 text-yellow-500" />
                        <h4 className="font-semibold text-sm md:text-base">Team Leader - {team.name}</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-3">
                        {team.description || "No description provided"}
                      </p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-xs md:text-sm">Team Members ({team.members.length}/{team.maxMembers}):</h5>
                        <div className="space-y-2 max-h-60 md:max-h-80 overflow-y-auto">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted rounded gap-2 print-team-member">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs md:text-sm truncate">{member.participant.fullName}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{member.participant.email}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{member.participant.collegeName}</p>
                              </div>
                              <div className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                                {member.participant.state}, {member.participant.district}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : participant.teamMember && participant.teamMember.length > 0 ? (
                <div className="space-y-4">
                  {participant.teamMember.map((membership) => (
                    <div key={membership.id} className="border rounded-lg p-3 md:p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <UsersIcon className="w-4 h-4 text-blue-500" />
                        <h4 className="font-semibold text-sm md:text-base">Team Member - {membership.team.name}</h4>
                      </div>
                      <div className="mb-3">
                        <h5 className="font-medium text-xs md:text-sm flex items-center gap-1">
                          <CrownIcon className="w-3 h-3 text-yellow-500" />
                          Team Leader:
                        </h5>
                        <div className="ml-4 p-2 bg-muted rounded mt-1">
                          <p className="font-medium text-xs md:text-sm">{membership.team.leader.fullName}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{membership.team.leader.email}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{membership.team.leader.collegeName}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-medium text-xs md:text-sm">All Team Members ({membership.team.members.length}/{membership.team.maxMembers}):</h5>
                        <div className="space-y-2 max-h-60 md:max-h-80 overflow-y-auto">
                          {membership.team.members.map((member) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted rounded gap-2 print-team-member">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs md:text-sm truncate">{member.participant.fullName}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{member.participant.email}</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{member.participant.collegeName}</p>
                              </div>
                              <div className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                                {member.participant.state}, {member.participant.district}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <UsersIcon className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-muted-foreground text-sm md:text-base">No Team Created</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    This user has not created or joined any team yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">

          {/* Registration Timeline */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">Registration Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-xs md:text-sm">
                <div className="print-item">
                  <label className="font-medium print-label">Registered At:</label>
                  <p className="text-muted-foreground wrap-break-word print-value">
                    {format(new Date(participant.registeredAt), "PPP 'at' p")}
                  </p>
                </div>
                {participant.paymentSubmittedAt && (
                  <div className="print-item">
                    <label className="font-medium print-label">Payment Submitted:</label>
                    <p className="text-muted-foreground wrap-break-word print-value">
                      {format(new Date(participant.paymentSubmittedAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}
                {participant.paymentVerifiedAt && (
                  <div className="print-item">
                    <label className="font-medium print-label">Payment Verified:</label>
                    <p className="text-muted-foreground wrap-break-word print-value">
                      {format(new Date(participant.paymentVerifiedAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Summary */}
          <Card className="print-section">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">Team Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 ">
              {participant.teamLeader && participant.teamLeader.length > 0 ? (
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">Role</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CrownIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs md:text-sm font-semibold">Team Leader</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1 print-value">
                    Leading {participant.teamLeader[0].members.length} member(s)
                  </p>
                </div>
              ) : participant.teamMember && participant.teamMember.length > 0 ? (
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">Role</label>
                  <div className="flex items-center gap-2 mt-1">
                    <UsersIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs md:text-sm">Team Member</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1 wrap-break-word print-value">
                    Member of "{participant.teamMember[0].team.name}"
                  </p>
                </div>
              ) : (
                <div className="print-item">
                  <label className="text-xs md:text-sm font-medium print-label">Team Status</label>
                  <p className="text-xs md:text-sm text-muted-foreground print-value">No team participation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}