import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Users, MapPin, Clock, Edit, Crown, UserPlus, Copy, KeyRound } from "lucide-react";
import Link from "next/link";
import { CopyTeamCodeButton } from "./_components/CopyTeamCodeButton";
import { JoinTeamButton } from "./_components/JoinTeamButton";
import { TeamJoinRequests } from "../_components/TeamJoinRequests";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{
    slugId: string;
  }>;
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

export default async function TeamDetailPage({ params }: PageProps) {
  const { slugId } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Find the team
  const team = await prisma.team.findUnique({
    where: { slugId },
    select: {
      id: true,
      name: true,
      description: true,
      slugId: true,
      teamCode: true,
      maxMembers: true,
      isPublic: true,
      leader: {
        select: {
          id: true,
          fullName: true,
          email: true,
          userId: true,
          user: {
            select: {
              name: true
            }
          }
        }
      },
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          venue: true
        }
      },
      members: {
        include: {
          participant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userId: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!team) {
    notFound();
  }

  const isLeader = team.leader.userId === session.user.id;
  const isMember = team.members.some((member: any) => 
    member.participant.userId === session.user.id
  );

  // Check if user is participating in the event (any status, not just confirmed)
  const userParticipation = await prisma.participation.findFirst({
    where: {
      userId: session.user.id,
      eventId: team.event.id
    }
  });

  const canJoinTeam = userParticipation && !isLeader && !isMember && team.members.length < team.maxMembers && team.isPublic;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {team.name}
              {team.isPublic && <Badge variant="secondary">Public</Badge>}
              {isLeader && <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                <Crown className="h-3 w-3 mr-1" />
                Team Leader
              </Badge>}
              {isMember && !isLeader && <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                Team Member
              </Badge>}
            </h1>
            <p className="text-muted-foreground mt-1">
              Team for {team.event.title}
              {isLeader && <span className="text-green-600 ml-2">• You have full edit access</span>}
              {isMember && !isLeader && <span className="text-blue-600 ml-2">• You have view access</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {isLeader && (
              <Button asChild>
                <Link href={`/dashboard/teams/${slugId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Team
                </Link>
              </Button>
            )}
            {canJoinTeam && (
              <JoinTeamButton teamSlugId={slugId} teamName={team.name} teamCode={team.teamCode || undefined} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Member Role Info - Only shown to team members */}
            {isMember && !isLeader && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">You are a team member</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    You can view team information but only the team leader can make changes.
                    Contact <strong>{team.leader.fullName}</strong> if you need any updates.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent>
                {team.description ? (
                  <RenderDescription json={parseContent(team.description)} />
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {team.event.date ? 
                      new Date(team.event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      "Date TBD"
                    }
                  </span>
                </div>
                {team.event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{team.event.venue}</span>
                  </div>
                )}
                {team.event.description && (
                  <div className="pt-2">
                    <RenderDescription json={parseContent(team.event.description)} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Requests - Only visible to team leaders */}
            {isLeader && (
              <TeamJoinRequests teamSlugId={slugId} />
            )}
          </div>

          {/* Team Members Sidebar */}
          <div className="space-y-6">
            {/* Team Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <span className="font-medium">{team.members.length}/{team.maxMembers} + 1 leader</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Visibility</span>
                  <Badge variant={team.isPublic ? "default" : "secondary"}>
                    {team.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                {isLeader && team.teamCode && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <KeyRound className="h-3 w-3" />
                        Team Code
                      </span>
                    </div>
                    <div className="relative">
                      <div className="bg-muted rounded px-3 py-2 text-center font-mono tracking-wider text-sm">
                        {team.teamCode}
                      </div>
                      <CopyTeamCodeButton teamCode={team.teamCode} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share this code with others to let them join your team
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Leader */}
            <Card>
              <CardHeader>
                <CardTitle>Team Leader</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(team.leader.user?.name || team.leader.fullName).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      {team.leader.user?.name || team.leader.fullName}
                      <Crown className="h-4 w-4 text-yellow-500" />
                    </p>
                    <p className="text-sm text-muted-foreground">{team.leader.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Members ({team.members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {team.members.length > 0 ? (
                  <div className="space-y-3">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {(member.participant.user?.name || member.participant.fullName).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {member.participant.user?.name || member.participant.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.participant.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No members yet
                  </p>
                )}
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </div>
  );
}