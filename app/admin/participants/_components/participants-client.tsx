"use client";

import { useState } from "react";
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
  EyeIcon, 
  MailIcon, 
  PhoneIcon, 
  UsersIcon,
  Crown,
  ChevronDown,
  ChevronRight,
  Users,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string | null;
  status: string;
  paymentAmount: number | null;
  registeredAt: Date;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  paidByTeamLeader?: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    paymentSubmittedAt: Date | null;
  } | null;
}

interface Participant {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  status: string;
  paymentAmount: number | null;
  paymentSubmittedAt: Date | null;
  registeredAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  event: {
    id: string;
    title: string;
    price: number;
    date: Date;
  };
  teamMembers?: TeamMember[];
  isTeamLeader?: boolean;
  teamSlugId?: string | null;
  paidByTeamLeader?: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    paymentSubmittedAt: Date | null;
  } | null;
}

interface ParticipantsPageClientProps {
  participants: Participant[];
  error?: string;
}

export default function ParticipantsPageClient({ participants, error }: ParticipantsPageClientProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeamExpansion = (participantId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(participantId)) {
      newExpanded.delete(participantId);
    } else {
      newExpanded.add(participantId);
    }
    setExpandedTeams(newExpanded);
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

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Participants Management</h1>
          <div className="text-red-600 text-sm md:text-base">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">Participants Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage all event participants and their registration status
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-muted/50 px-3 py-2 rounded-lg">
          <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs md:text-sm font-medium">{participants.length} Total Participants</span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">All Participants</CardTitle>
          <CardDescription className="text-sm">
            View and manage participant registrations, payments, and status. Team leaders show their team members below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {participants.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4">
              <UsersIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">No participants yet</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Participants will appear here once they register for events
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3 p-4">
                {participants.map((participant) => (
                  <Card key={participant.id} className="p-4">
                    <div className="space-y-3">
                      {/* Participant Info */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={participant.user.image || ""} />
                          <AvatarFallback>
                            {participant.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate flex items-center gap-2">
                            {participant.fullName}
                            {participant.isTeamLeader && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {participant.user.email}
                          </div>
                          {participant.teamMembers && participant.teamMembers.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                              <Users className="h-3 w-3" />
                              <span>{participant.teamMembers.length} team member{participant.teamMembers.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {participant.paidByTeamLeader && (
                            <div className="text-xs text-green-600 mt-1">
                              Paid by: {participant.paidByTeamLeader.fullName}
                            </div>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(participant.status)} text-xs shrink-0`}>
                          {participant.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Event Info */}
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="font-medium text-sm">{participant.event.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Event: {formatDate(participant.event.date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Registered: {formatDate(participant.registeredAt)}
                        </div>
                      </div>

                      {/* Team Members Toggle for Mobile */}
                      {participant.teamMembers && participant.teamMembers.length > 0 && (
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTeamExpansion(participant.id)}
                            className="h-6 p-1 text-xs cursor-pointer"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            {participant.teamMembers.length} team member{participant.teamMembers.length !== 1 ? 's' : ''}
                            {expandedTeams.has(participant.id) ? (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronRight className="h-3 w-3 ml-1" />
                            )}
                          </Button>

                          {/* Team members list */}
                          {expandedTeams.has(participant.id) && (
                            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                              {participant.teamMembers.map((member: TeamMember) => (
                                <div key={member.id} className="bg-gray-50/10 p-2 rounded text-xs space-y-1">
                                  <div className="font-medium flex items-center gap-1">
                                    <span>↳</span> {member.fullName}
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                      Team Member
                                    </Badge>
                                    {member.paidByTeamLeader && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-700">
                                        Paid by Leader
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground truncate">{member.user.email}</div>
                                  <div className="text-blue-600">
                                    Joined: {formatDate(member.joinedAt)}
                                  </div>
                                  {member.paidByTeamLeader && (
                                    <div className="text-green-600 text-[10px]">
                                      Payment covered by team leader
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact & Payment */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <MailIcon className="w-3 h-3" />
                            <span className="truncate">{participant.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{participant.mobileNumber}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ₹{participant.paymentAmount || participant.event.price}
                          </div>
                          {participant.paymentSubmittedAt && (
                            <div className="text-muted-foreground">
                              Paid: {formatDate(participant.paymentSubmittedAt)}
                            </div>
                          )}
                          {participant.teamMembers && participant.teamMembers.length > 0 && (
                            <div className="text-blue-600 font-medium">
                              Covers team ({participant.teamMembers.length + 1})
                            </div>
                          )}
                          {participant.paidByTeamLeader && (
                            <div className="text-green-600 font-medium">
                              Paid by Leader
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/admin/participants/${participant.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full cursor-pointer">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Participant</TableHead>
                      <TableHead className="min-w-[180px]">Event</TableHead>
                      <TableHead className="min-w-40">Contact</TableHead>
                      <TableHead className="min-w-[140px]">Registration Date</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Payment</TableHead>
                      <TableHead className="min-w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <>
                        {/* Main Participant Row */}
                        <TableRow key={participant.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                                <AvatarImage src={participant.user.image || ""} />
                                <AvatarFallback>
                                  {participant.fullName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium text-sm lg:text-base truncate flex items-center gap-2">
                                  {participant.fullName}
                                  {participant.isTeamLeader && (
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                  )}
                                  {participant.teamMembers && participant.teamMembers.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleTeamExpansion(participant.id)}
                                      className="h-6 w-6 p-0 ml-2 cursor-pointer"
                                    >
                                      {expandedTeams.has(participant.id) ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <div className="text-xs lg:text-sm text-muted-foreground truncate">
                                  {participant.user.email}
                                </div>
                                {participant.teamMembers && participant.teamMembers.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <Users className="h-3 w-3" />
                                    <span>{participant.teamMembers.length} team member{participant.teamMembers.length !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                                {participant.paidByTeamLeader && (
                                  <div className="text-xs text-green-600">
                                    Paid by: {participant.paidByTeamLeader.fullName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm lg:text-base">{participant.event.title}</div>
                              <div className="text-xs lg:text-sm text-muted-foreground">
                                {formatDate(participant.event.date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs lg:text-sm">
                                <MailIcon className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{participant.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs lg:text-sm">
                                <PhoneIcon className="w-3 h-3" />
                                {participant.mobileNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-xs lg:text-sm">
                              <CalendarIcon className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
                              {formatDate(participant.registeredAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(participant.status)} text-xs`}>
                              {participant.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs lg:text-sm">
                              {participant.paymentAmount ? (
                                <div className="font-medium">₹{participant.paymentAmount}</div>
                              ) : (
                                <div className="text-muted-foreground">₹{participant.event.price}</div>
                              )}
                              {participant.paymentSubmittedAt && (
                                <div className="text-xs text-muted-foreground">
                                  Paid: {formatDate(participant.paymentSubmittedAt)}
                                </div>
                              )}
                              {participant.teamMembers && participant.teamMembers.length > 0 && (
                                <div className="text-xs text-blue-600 font-medium">
                                  Covers team ({participant.teamMembers.length + 1} members)
                                </div>
                              )}
                              {participant.paidByTeamLeader && (
                                <div className="text-xs text-green-600 font-medium">
                                  Paid by: {participant.paidByTeamLeader.fullName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Link href={`/admin/participants/${participant.id}`}>
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                  <EyeIcon className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                                  <span className="hidden lg:inline">View</span>
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Team Members Rows */}
                        {participant.teamMembers && 
                         participant.teamMembers.length > 0 && 
                         expandedTeams.has(participant.id) && 
                         participant.teamMembers.map((member: TeamMember, memberIndex: number) => (
                          <TableRow 
                            key={`${participant.id}-member-${member.id}`} 
                            className="bg-gray-50/10 hover:bg-black border-l-4 border-l-blue-200"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3 pl-6">
                                <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                                  <AvatarImage src={member.user.image || ""} />
                                  <AvatarFallback>
                                    {member.fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    <span>↳</span> {member.fullName}
                                    <Badge variant="outline" className="text-xs">
                                      Team Member
                                    </Badge>
                                    {member.paidByTeamLeader && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        Paid by Leader
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {member.user.email}
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    Joined: {formatDate(member.joinedAt)}
                                  </div>
                                  {member.paidByTeamLeader && (
                                    <div className="text-xs text-green-600">
                                      Payment covered by: {member.paidByTeamLeader.fullName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                Same as team leader
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs lg:text-sm">
                                  <MailIcon className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs lg:text-sm">
                                  <PhoneIcon className="w-3 h-3" />
                                  {member.mobileNumber}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs lg:text-sm text-muted-foreground">
                                Joined: {formatDate(member.joinedAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.paidByTeamLeader ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  Paid by Leader
                                </Badge>
                              ) : (
                                <Badge className={`${getStatusColor(member.status)} text-xs`}>
                                  {member.status.replace('_', ' ')}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {member.paidByTeamLeader ? (
                                <div className="text-xs text-green-600">
                                  Included in team payment
                                </div>
                              ) : (
                                <div className="text-xs">
                                  {member.paymentAmount ? (
                                    <div className="font-medium">₹{member.paymentAmount}</div>
                                  ) : (
                                    <div className="text-muted-foreground">Individual payment</div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Link href={`/admin/participants/${member.id}`}>
                                  <Button variant="ghost" size="sm" className="cursor-pointer">
                                    <EyeIcon className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                                    <span className="hidden lg:inline">View</span>
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}