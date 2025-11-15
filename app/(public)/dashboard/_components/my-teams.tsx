"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users,
  Crown,
  Calendar,
  MapPin,
  ExternalLink,
  UserPlus,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";

interface TeamMembership {
  id: string;
  joinedAt: Date;
  team: {
    id: string;
    name: string;
    slugId: string | null;
    description: string | null;
    maxMembers: number;
    isPublic: boolean;
    createdAt: Date;
    event: {
      id: string;
      title: string;
      category: string;
      date: Date;
    };
    leader?: {
      id: string;
      fullName: string;
      email: string;
    };
    members?: {
      id: string;
      participant: {
        fullName: string;
        email: string;
      };
    }[];
    _count?: {
      members: number;
    };
  };
}

interface TeamLeadership {
  id: string;
  name: string;
  slugId: string | null;
  description: string | null;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  event: {
    id: string;
    title: string;
    category: string;
    date: Date;
  };
  members: {
    id: string;
    participant: {
      fullName: string;
      email: string;
    };
  }[];
}

interface MyTeamsProps {
  teamMemberships: TeamMembership[];
  teamLeaderships?: TeamLeadership[];
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

export function MyTeams({ teamMemberships, teamLeaderships = [] }: MyTeamsProps) {
  const allTeams = [
    ...teamLeaderships.map(team => ({
      ...team,
      isLeader: true,
      isMember: false,
      joinedAt: team.createdAt,
      memberCount: team.members.length, // Don't count leader as member
      leader: undefined, // Leader info not needed when user is the leader
    })),
    ...teamMemberships.map(membership => ({
      ...membership.team,
      isLeader: false,
      isMember: true,
      joinedAt: membership.joinedAt,
      memberCount: (membership.team.members?.length || 0) + 1, // +1 for leader
    }))
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (allTeams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Teams
          </CardTitle>
          <CardDescription>
            Teams you've joined or are leading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a team or join an existing one to collaborate with others.
            </p>
            <Button asChild>
              <Link href="/dashboard/teams">
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Teams
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          My Teams
        </CardTitle>
        <CardDescription className="text-sm">
          Teams you've joined or are leading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {allTeams.slice(0, 4).map((team) => (
            <div 
              key={`${team.id}-${team.isLeader ? 'leader' : 'member'}`}
              className="flex flex-col sm:flex-row sm:items-start justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {team.isLeader ? (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Users className="w-4 h-4 text-blue-500" />
                      )}
                      <h4 className="font-semibold text-base sm:text-lg">{team.name}</h4>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{format(new Date(team.event.date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{team.event.title}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {team.event.category}
                    </Badge>
                    <Badge 
                      variant={team.isLeader ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {team.isLeader ? "Leader" : "Member"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {team.memberCount}/{team.maxMembers} members
                      </span>
                    </div>
                    
                    <Badge variant={team.isPublic ? "outline" : "secondary"} className="text-xs">
                      {team.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {team.slugId && (
                      <Button size="sm" variant="ghost" asChild className="text-xs">
                        <Link href={`/dashboard/teams/${team.slugId}`}>
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="ml-1 sm:ml-0 sm:sr-only lg:not-sr-only">View</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-1 border-t sm:border-t-0 sm:pt-0">
                    <RenderDescription json={parseContent(team.description)} />
                  </p>
                )}

                {/* Team Members Preview */}
                {(team.isLeader || team.isMember) && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Members:</span>
                    <div className="flex -space-x-1">
                      {/* Show leader avatar first if user is member */}
                      {!team.isLeader && 'leader' in team && team.leader && (
                        <Avatar className="w-6 h-6 border-2 border-background" title={team.leader.fullName}>
                          <AvatarFallback className="text-xs bg-yellow-100 text-yellow-700">
                            {getInitials(team.leader.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {/* Show first few members */}
                      {team.members?.slice(0, 3).map((member) => (
                        <Avatar 
                          key={member.id} 
                          className="w-6 h-6 border-2 border-background" 
                          title={member.participant.fullName}
                        >
                          <AvatarFallback className="text-xs">
                            {getInitials(member.participant.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      
                      {team.memberCount > 4 && (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{team.memberCount - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-1">
                  {team.isLeader ? 'Created' : 'Joined'}: {format(new Date(team.joinedAt), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>
            </div>
          ))}

          {allTeams.length > 4 && (
            <div className="text-center pt-4">
              <Button variant="outline" asChild className="w-full sm:w-auto text-sm">
                <Link href="/dashboard/teams">
                  <Users className="w-4 h-4 mr-2" />
                  View All Teams ({allTeams.length})
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}