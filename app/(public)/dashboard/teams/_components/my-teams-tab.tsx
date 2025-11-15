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
  Eye,
  Settings,
  Info
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";

interface TeamData {
  participation: any;
  team: any;
  isLeader: boolean;
  isMember: boolean;
}

interface MyTeamsTabProps {
  userTeams: any[];
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

export function MyTeamsTab({ userTeams }: MyTeamsTabProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Flatten and process all teams (both leading and member)
  const allTeams = userTeams.flatMap((participation: any) => {
    const teams: TeamData[] = [];
    
    // Add teams where user is a leader
    if (participation.teamLeader && participation.teamLeader.length > 0) {
      participation.teamLeader.forEach((team: any) => {
        teams.push({
          participation,
          team,
          isLeader: true,
          isMember: false
        });
      });
    }
    
    // Add teams where user is a member
    if (participation.teamMember && participation.teamMember.length > 0) {
      participation.teamMember.forEach((memberRecord: any) => {
        teams.push({
          participation,
          team: memberRecord.team,
          isLeader: false,
          isMember: true
        });
      });
    }
    
    return teams;
  });

  if (allTeams.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Teams
            </CardTitle>
            <CardDescription>
              All teams you're leading or participating in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't joined or created any teams yet. Start by creating a team for your registered events or join an existing team using a team code.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Teams ({allTeams.length})
          </CardTitle>
          <CardDescription>
            All teams you're leading or participating in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6">
            {allTeams.map((teamData: TeamData, index: number) => {
              const { participation, team, isLeader, isMember } = teamData;
              
              return (
                <Card key={`${participation.event.id}-${team.id}-${index}`} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {isLeader ? (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Users className="w-5 h-5 text-blue-500" />
                          )}
                          <h3 className="text-lg font-semibold">{team.name}</h3>
                          <Badge 
                            variant={isLeader ? "default" : "outline"} 
                            className="ml-2"
                          >
                            {isLeader ? "Leader" : "Member"}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(participation.event.date), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{participation.event.title}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {participation.event.category}
                        </Badge>
                        <Badge 
                          variant={team.isPublic ? "outline" : "secondary"} 
                          className="text-xs"
                        >
                          {team.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {team.description && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <RenderDescription json={parseContent(team.description)} />
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {(team.members?.length || 0)}/{team.maxMembers} members + 1 leader
                          </span>
                        </div>
                        
                        {/* Team Members Preview */}
                        <div className="flex -space-x-1">
                          {/* Show first few members */}
                          {team.members?.slice(0, 4).map((member: any) => (
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
                          
                          {(team.members?.length || 0) > 4 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                +{(team.members?.length || 0) - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {team.slugId && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/teams/${team.slugId}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        )}
                        
                        {isLeader && team.slugId && (
                          <Button size="sm" variant="default" asChild>
                            <Link href={`/dashboard/teams/${team.slugId}/edit`}>
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {isLeader ? 'Created' : 'Joined'}: {format(new Date(team.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                      
                      {isLeader && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Info className="w-3 h-3" />
                          <span>You have full management access</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}