"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MapPinIcon, UsersIcon, CrownIcon, LockIcon, UnlockIcon, Eye, Search, Filter, Zap, RefreshCw, ChevronDown, Star } from "lucide-react";
import { format } from "date-fns";
import { joinTeam } from "../actions";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import Link from "next/link";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";

interface Team {
  id: string;
  name: string;
  slugId?: string | null;
  description?: string | null;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  event: {
    id: string;
    title: string;
    category: string;
    date: Date;
  };
  leader: {
    fullName: string;
    collegeName: string;
  };
  members: Array<{
    id: string;
    participant: {
      fullName: string;
    };
  }>;
}

interface AvailableTeamsProps {
  teams: Team[];
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

export function AvailableTeams({ teams }: AvailableTeamsProps) {
  const [joiningTeam, setJoiningTeam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleJoinTeam = async (teamName: string, eventId: string) => {
    setJoiningTeam(teamName);

    try {
      const result = await joinTeam({
        teamName,
        eventId
      });

      if (result.status === "success") {
        toast.success("🎉 Successfully joined team!", {
          description: `Welcome to ${teamName}! Check your teams tab to see your new team.`
        });
        // Refresh page
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to join team");
    } finally {
      setJoiningTeam(null);
    }
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(teams.map(team => team.event.category))];
    return uniqueCategories.sort();
  }, [teams]);

  // Filter teams based on search and filters
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      // Search filter
      const matchesSearch = !searchQuery || 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.leader.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.leader.collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "all" || team.event.category === selectedCategory;

      // Availability filter
      const matchesAvailability = 
        selectedAvailability === "all" ||
        (selectedAvailability === "open" && team.isPublic && team.members.length < team.maxMembers) ||
        (selectedAvailability === "full" && team.members.length >= team.maxMembers) ||
        (selectedAvailability === "private" && !team.isPublic);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [teams, searchQuery, selectedCategory, selectedAvailability]);

  // Get recommended teams (teams with space that are public)
  const recommendedTeams = useMemo(() => {
    return filteredTeams
      .filter(team => team.isPublic && team.members.length < team.maxMembers)
      .slice(0, 3);
  }, [filteredTeams]);

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12 px-4">
          <UsersIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">No Teams Available</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            There are currently no public teams looking for members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              Discover Teams
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Find and join teams for your registered events
            </p>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm w-fit">
            {filteredTeams.length} of {teams.length} team{teams.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams, events, or leaders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            Filters
            <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {(selectedCategory !== "all" || selectedAvailability !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedAvailability("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
            <div>
              <label className="text-xs font-medium mb-2 block">Event Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block">Availability</label>
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="open">Open to Join</SelectItem>
                  <SelectItem value="full">Full Teams</SelectItem>
                  <SelectItem value="private">Private Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Teams */}
      {!searchQuery && selectedCategory === "all" && selectedAvailability === "all" && recommendedTeams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold">Recommended for You</h4>
            <Badge variant="secondary" className="text-xs">Available to Join</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedTeams.map((team) => (
              <TeamCard key={`rec-${team.id}`} team={team} handleJoinTeam={handleJoinTeam} joiningTeam={joiningTeam} isRecommended={true} />
            ))}
          </div>
        </div>
      )}

      {/* All Teams */}
      <div className="space-y-3">
        {filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 px-4">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-base font-semibold text-muted-foreground mb-1">No Teams Found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">All Teams</h4>
              <span className="text-xs text-muted-foreground">
                {filteredTeams.filter(team => team.isPublic && team.members.length < team.maxMembers).length} available to join
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredTeams.map((team) => (
                <TeamCard key={team.id} team={team} handleJoinTeam={handleJoinTeam} joiningTeam={joiningTeam} isRecommended={false} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Separate TeamCard component for better organization
function TeamCard({ team, handleJoinTeam, joiningTeam, isRecommended }: {
  team: Team;
  handleJoinTeam: (teamName: string, eventId: string) => Promise<void>;
  joiningTeam: string | null;
  isRecommended: boolean;
}) {
  const canJoin = team.isPublic && team.members.length < team.maxMembers;

  return (
    <Card key={team.id} className={`hover:shadow-md transition-all duration-200 ${isRecommended ? 'ring-1 ring-amber-200 bg-amber-50/30 dark:bg-amber-950/20 dark:ring-amber-800' : ''}`}>
      <CardHeader className="pb-3 px-3 sm:px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              {isRecommended && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
              {team.isPublic ? (
                <UnlockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
              ) : (
                <LockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
              )}
              <span className="truncate">{team.name}</span>
            </CardTitle>
            <CardDescription className="text-xs mt-1 truncate">
              {team.event.title}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs ml-2 shrink-0">
            {team.event.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4">

        {/* Team Description */}
        {team.description && (
          <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            <RenderDescription json={parseContent(team.description)} />
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="w-3 h-3 shrink-0" />
            <span>{format(new Date(team.event.date), "MMM dd, yyyy")}</span>
          </div>
        </div>

        <Separator />

        {/* Team Leader */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CrownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Team Leader</span>
          </div>
          <div className="flex items-center gap-2 ml-4 sm:ml-6">
            <Avatar className="w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <AvatarFallback className="text-xs">
                {team.leader.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{team.leader.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{team.leader.collegeName}</p>
            </div>
          </div>
        </div>

        {/* Members Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm">
              {team.members.length}/{team.maxMembers} members
            </span>
          </div>
          <div className="flex -space-x-1">
            {team.members.slice(0, 3).map((member, index) => (
              <Avatar key={member.id} className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {member.participant.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 3 && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium">+{team.members.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {team.slugId && (
              <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Link href={`/dashboard/teams/${team.slugId}`}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              className={`${team.slugId ? 'flex-1' : 'w-full'} h-8 text-xs ${
                canJoin && isRecommended 
                  ? 'bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md'
                  : canJoin
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : ''
              }`}
              onClick={() => handleJoinTeam(team.name, team.event.id)}
              disabled={!canJoin || joiningTeam === team.name}
            >
              {joiningTeam === team.name ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : canJoin && isRecommended ? (
                <Zap className="w-3 h-3 mr-1" />
              ) : null}
              {joiningTeam === team.name ? (
                "Joining..."
              ) : !team.isPublic ? (
                "Private"
              ) : team.members.length >= team.maxMembers ? (
                "Full"
              ) : isRecommended ? (
                "Quick Join"
              ) : (
                "Join Team"
              )}
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Created {format(new Date(team.createdAt), "MMM dd")}
          {isRecommended && canJoin && (
            <Badge variant="outline" className="ml-2 text-xs px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">
              Recommended
            </Badge>
          )}
          {team.slugId && (
            <span className="block text-xs font-mono text-muted-foreground/70 mt-1 truncate">
              ID: {team.slugId}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}