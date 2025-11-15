import { getTeamBySlugId } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarIcon, 
  MapPinIcon, 
  TagIcon, 
  PhoneIcon, 
  Crown,
  Users,
  Hash,
  Clock,
  Shield,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";

interface TeamDetailPageProps {
  params: Promise<{ slugId: string }>;
}

// Helper function to safely parse JSON content
const parseContent = (content: any) => {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse JSON content:", error);
      // Return a simple text node structure for TipTap
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: content,
              },
            ],
          },
        ],
      };
    }
  }
  return content;
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { slugId } = await params;
  const result = await getTeamBySlugId(slugId);

  if (result.status === "error") {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Team Details</h1>
          <div className="text-red-600 text-sm md:text-base">{result.message}</div>
        </div>
      </div>
    );
  }

  const team = result.data;
  
  if (!team) {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Team Details</h1>
          <div className="text-red-600 text-sm md:text-base">Team not found</div>
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

  const getJoinRequestStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalMembers = team.members.length; // Don't count leader as member
  const confirmedMembers = team.members.filter(member => member.participant.status === 'CONFIRMED').length + 
                          (team.leader.status === 'CONFIRMED' ? 1 : 0);

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
            <Badge variant="outline" className="text-xs md:text-sm">
              <Users className="w-3 h-3 mr-1" />
              {totalMembers}/{team.maxMembers} Members + 1 Leader
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Team details and member management for {team.event.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Details */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          {/* Team Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Team Name</label>
                  <p className="text-base font-semibold">{team.name}</p>
                </div>
                {team.teamCode && (
                  <div>
                    <label className="text-sm font-medium">Team Code</label>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-semibold text-blue-600">{team.teamCode}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <div className="flex items-center gap-2">
                    {team.isPublic ? (
                      <>
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Public</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-600">Private</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(team.createdAt), "PPP")}</span>
                  </div>
                </div>
              </div>

              {team.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                    <RenderDescription json={parseContent(team.description)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-semibold text-base md:text-lg">{team.event.title}</h3>
                  <Badge variant="secondary" className="text-xs md:text-sm w-fit">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {team.event.category}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{format(new Date(team.event.date), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="wrap-break-word">{team.event.venue}</span>
                  </div>
                </div>
                <div className="text-lg md:text-xl font-semibold">
                  Registration Fee: {formatCurrency(team.event.price)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Leader */}
          <Card className="border-2 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                Team Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto sm:mx-0">
                  <AvatarImage src={team.leader.user.image || ""} />
                  <AvatarFallback className="text-lg md:text-xl">
                    {team.leader.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg md:text-xl font-semibold">{team.leader.fullName}</h3>
                  <p className="text-sm md:text-base text-muted-foreground break-all">{team.leader.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                    <Badge className={`${getStatusColor(team.leader.status)} text-xs`}>
                      {team.leader.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      Team Leader
                    </Badge>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <Link href={`/admin/participants/${team.leader.id}`}>
                    <Button variant="outline" size="lg" className="cursor-pointer">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                Team Members ({team.members.length})
              </CardTitle>
              <CardDescription>
                Members who have joined this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {team.members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                  <p className="text-muted-foreground">
                    Team members will appear here when they join the team
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-3">
                    {team.members.map((member) => (
                      <Card key={member.id} className="p-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={member.participant.user.image || ""} />
                              <AvatarFallback>
                                {member.participant.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                                <span className="truncate">{member.participant.fullName}</span>
                                <Badge variant="outline" className="text-xs">
                                  Team Member
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground break-all">{member.participant.email}</div>
                              <div className="text-xs text-blue-600">
                                Joined: {format(new Date(member.joinedAt), "PPP")}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(member.participant.status)} text-xs`}>
                              {member.participant.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="w-3 h-3 shrink-0" />
                              <span>{member.participant.mobileNumber}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div className="font-medium">{member.participant.collegeName}</div>
                              <div>{member.participant.state}, {member.participant.district}</div>
                            </div>
                          </div>
                          
                          <Link href={`/admin/participants/${member.participant.id}`}>
                            <Button variant="outline" size="sm" className="w-full cursor-pointer">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>College</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={member.participant.user.image || ""} />
                                  <AvatarFallback>
                                    {member.participant.fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-medium flex items-center gap-2">
                                    <span className="truncate">{member.participant.fullName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Team Member
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">{member.participant.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <PhoneIcon className="w-3 h-3" />
                                  <span>{member.participant.mobileNumber}</span>
                                </div>
                                {member.participant.whatsappNumber && (
                                  <div className="text-xs text-muted-foreground">
                                    WA: {member.participant.whatsappNumber}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="wrap-break-word">{member.participant.collegeName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {member.participant.state}, {member.participant.district}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{format(new Date(member.joinedAt), "PPP")}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(member.participant.status)} text-xs`}>
                                {member.participant.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/admin/participants/${member.participant.id}`}>
                                <Button variant="ghost" size="sm" className="cursor-pointer border">
                                  View Details
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Join Requests */}
          {team.joinRequests.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                  Join Requests ({team.joinRequests.length})
                </CardTitle>
                <CardDescription>
                  Pending and processed join requests for this team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.joinRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={request.participant.user.image || ""} />
                            <AvatarFallback>
                              {request.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{request.fullName}</div>
                            <div className="text-sm text-muted-foreground">{request.email}</div>
                            <div className="text-xs text-muted-foreground">
                              Requested: {format(new Date(request.requestedAt), "PPP")}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getJoinRequestStatusColor(request.status)} text-xs`}>
                          {request.status}
                        </Badge>
                      </div>
                      {request.message && (
                        <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                          <strong>Message:</strong> {request.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Team Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg lg:text-xl">Team Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-semibold text-xl text-blue-600">{totalMembers}</div>
                  <div className="text-xs text-muted-foreground">Total Members</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-semibold text-xl text-green-600">{confirmedMembers}</div>
                  <div className="text-xs text-muted-foreground">Confirmed</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-semibold text-xl text-orange-600">{team.maxMembers}</div>
                  <div className="text-xs text-muted-foreground">Max Capacity</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-semibold text-xl text-purple-600">{team.joinRequests.filter(r => r.status === 'PENDING').length}</div>
                  <div className="text-xs text-muted-foreground">Pending Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg lg:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/participants/${team.leader.id}`} className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <Crown className="w-4 h-4 mr-2" />
                  View Team Leader
                </Button>
              </Link>
              <Link href={`/admin/events/${team.event.slugId}`} className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  View Event Details
                </Button>
              </Link>
              <Link href="/admin/team" className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <Users className="w-4 h-4 mr-2" />
                  All Teams
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}