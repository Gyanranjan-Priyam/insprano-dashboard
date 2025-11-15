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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CalendarIcon, 
  EyeIcon, 
  MailIcon, 
  PhoneIcon, 
  UsersIcon,
  Crown,
  Users,
  ExternalLink,
  Filter,
  Hash,
  Shield,
  Clock,
  AlertCircle,
  TrendingUp,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface TeamMember {
  id: string;
  joinedAt: Date;
  participant: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    paymentAmount: number | null;
    paymentSubmittedAt: Date | null;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  };
}

interface JoinRequest {
  id: string;
  participant: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Team {
  id: string;
  name: string;
  slugId: string | null;
  teamCode: string | null;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  description: string | null;
  event: {
    id: string;
    title: string;
    slugId: string;
    category: string;
    price: number;
    date: Date;
    venue: string;
  };
  leader: {
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
  };
  members: TeamMember[];
  joinRequests: JoinRequest[];
}

interface TeamStatistics {
  totalTeams: number;
  teamsWithMembers: number;
  totalMembers: number;
  pendingRequests: number;
}

interface TeamsPageClientProps {
  teams: Team[];
  categories: string[];
  statistics: TeamStatistics;
  error?: string;
}

export default function TeamsPageClient({ teams, categories, statistics, error }: TeamsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const filteredTeams = teams.filter(team => {
    const matchesCategory = selectedCategory === "all" || team.event.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leader.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leader.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.teamCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const getTeamCompletionRate = (team: Team) => {
    const totalMembers = team.members.length; // Don't count leader as member
    return Math.round((totalMembers / team.maxMembers) * 100);
  };

  const getConfirmedMembersCount = (team: Team) => {
    const confirmedMembers = team.members.filter(member => 
      member.participant.status === 'CONFIRMED'
    ).length;
    const leaderConfirmed = team.leader.status === 'CONFIRMED' ? 1 : 0;
    return confirmedMembers + leaderConfirmed;
  };

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Teams Management</h1>
          <div className="text-red-600 text-sm md:text-base">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">Teams Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 ">
            Manage all registered teams, their members, and join requests
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-muted/50 px-3 py-2 rounded-lg">
          <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs md:text-sm font-medium">{filteredTeams.length} Teams</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-semibold text-lg text-blue-600">{statistics.totalTeams}</div>
                <div className="text-xs text-muted-foreground">Total Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-semibold text-lg text-green-600">{statistics.totalMembers}</div>
                <div className="text-xs text-muted-foreground">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <div>
                <div className="font-semibold text-lg text-purple-600">{statistics.teamsWithMembers}</div>
                <div className="text-xs text-muted-foreground">Active Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <div>
                <div className="font-semibold text-lg text-orange-600">{statistics.pendingRequests}</div>
                <div className="text-xs text-muted-foreground">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl">All Teams</CardTitle>
              <CardDescription className="text-sm">
                View and manage team registrations, members, and join requests
              </CardDescription>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search teams, events, leaders, or team codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4">
              <UsersIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">
                {selectedCategory === "all" ? "No teams yet" : `No teams in ${selectedCategory}`}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Teams will appear here once they are created for events
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3 p-4">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="p-4">
                    <div className="space-y-3">
                      {/* Team Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                            <span className="truncate">{team.name}</span>
                            {team.teamCode && (
                              <Badge variant="outline" className="text-xs">
                                <Hash className="w-3 h-3 mr-1" />
                                {team.teamCode}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{team.event.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {team.event.category}
                            </Badge>
                            <Badge variant={team.isPublic ? "default" : "secondary"} className="text-xs">
                              {team.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-medium">
                            {team.members.length}/{team.maxMembers} Members + 1 Leader
                          </div>
                          <div className="text-xs text-green-600">
                            {getConfirmedMembersCount(team)} Confirmed
                          </div>
                        </div>
                      </div>

                      {/* Team Leader */}
                      <div className="hover:bg-gray-50/10 p-2 rounded flex items-center gap-2 mt-2">
                        <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{team.leader.fullName}</div>
                          <div className="text-xs text-muted-foreground truncate">{team.leader.email}</div>
                        </div>
                        <Badge className={`${getStatusColor(team.leader.status)} text-xs`}>
                          {team.leader.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Event Info */}
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">
                          Event: {formatDate(team.event.date)} • {team.event.venue}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {formatDate(team.createdAt)}
                        </div>
                        {team.joinRequests.length > 0 && (
                          <div className="text-xs text-orange-600 font-medium">
                            {team.joinRequests.length} pending request{team.joinRequests.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 cursor-pointer">
                        {team.slugId ? (
                          <Link href={`/admin/team/${team.slugId}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View Team
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="flex-1">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            No Slug
                          </Button>
                        )}
                        <Link href={`/admin/participants/${team.leader.id}`}>
                          <Button variant="outline" size="sm">
                            <Crown className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sl No</TableHead>
                      <TableHead className="min-w-[200px]">Team</TableHead>
                      <TableHead className="min-w-[120px]">Category</TableHead>
                      <TableHead className="min-w-[180px]">Event</TableHead>
                      <TableHead className="min-w-[180px]">Team Leader</TableHead>
                      <TableHead className="min-w-[120px]">Members</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team, index) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <span className="truncate text-xl">{team.name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <span className="font-medium text-xl">{team.event.category}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-xl">{team.event.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <span className="truncate font-medium text-xl">{team.leader.fullName}</span>
                                <Crown className="size-5 text-yellow-500" />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-xl">
                              {team.members.length}/{team.maxMembers}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="h-auto w-auto p-4">
                              {team.slugId ? (
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/team/${team.slugId}`} className="cursor-pointer">
                                    <span className="flex items-center text-[17px] font-semibold mb-2"><EyeIcon className="size-5 mr-2" />
                                    View Team</span>
                                  </Link>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled>
                                  <span className="flex items-center text-[17px] font-semibold mb-2"><EyeIcon className="size-5 mr-2" />
                                    View Team</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/participants/${team.leader.id}`} className="cursor-pointer">
                                  <span className="flex items-center text-[17px] font-semibold mb-2"><Crown className="w-4 h-4 mr-2" />View Leader</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${team.event.slugId}`} className="cursor-pointer">
                                  <span className="flex items-center text-[17px] font-semibold mb-2"><ExternalLink className="w-4 h-4 mr-2" />View Event</span>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </div>
  );
}