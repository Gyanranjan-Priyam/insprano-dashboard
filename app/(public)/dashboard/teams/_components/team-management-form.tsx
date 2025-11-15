"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { createTeam, joinTeam, leaveTeam } from "../actions";
import { toast } from "sonner";
import { UsersIcon, PlusIcon, LogOutIcon, CrownIcon, Edit, Eye } from "lucide-react";
import Link from "next/link";

interface TeamData {
  participation: any;
  team: any;
  isLeader: boolean;
  isMember: boolean;
}

interface Event {
  id: string;
  title: string;
  category: string;
  date: Date;
  venue: string;
  teamSize?: number | null;
}

interface TeamManagementFormProps {
  events: Event[];
  userTeams: any[];
}

export function TeamManagementForm({ events, userTeams }: TeamManagementFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [newTeamData, setNewTeamData] = useState({
    name: "",
    description: "",
    isPublic: "true"
  });

  const [joinTeamName, setJoinTeamName] = useState("");

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createTeam({
        name: newTeamData.name,
        eventId: selectedEvent,
        description: newTeamData.description,
        isPublic: newTeamData.isPublic === "true"
      });

      if (result.status === "success") {
        const selectedEventData = events.find(e => e.id === selectedEvent);
        toast.success(`Team created successfully! Maximum ${selectedEventData?.teamSize || 4} members allowed (plus leader).`);
        // Reset form
        setNewTeamData({
          name: "",
          description: "",
          isPublic: "true"
        });
        setSelectedEvent("");
        // Refresh page
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create team");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    setIsJoining(true);

    try {
      const result = await joinTeam({
        teamName: joinTeamName,
        eventId: selectedEvent
      });

      if (result.status === "success") {
        toast.success("Successfully joined team!");
        setJoinTeamName("");
        setSelectedEvent("");
        // Refresh page
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to join team");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTeam = async (eventId: string) => {
    setIsLeaving(true);

    try {
      const result = await leaveTeam(eventId);

      if (result.status === "success") {
        toast.success("Successfully left team!");
        // Refresh page
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to leave team");
    } finally {
      setIsLeaving(false);
    }
  };

  // Check if user has a team for the selected event
  const hasTeamForEvent = selectedEvent && userTeams.some(participation => 
    participation.event.id === selectedEvent && 
    ((participation.teamLeader && participation.teamLeader.length > 0) || 
     (participation.teamMember && participation.teamMember.length > 0))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Team Creation/Joining Forms */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Team Management
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a new team or join an existing one for your confirmed events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Event Selection */}
            <div>
              <Label htmlFor="eventSelect" className="text-sm sm:text-base mb-2">Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Choose a confirmed event to manage teams for" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id} className="text-sm sm:text-base">
                      <div className="flex flex-col">
                        <span>{event.title} - {event.category}</span>
                        <span className="text-xs text-muted-foreground">
                          Max team size: {event.teamSize || 4} members + 1 leader
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvent && hasTeamForEvent && (
                <p className="text-xs sm:text-sm text-yellow-600 mt-2">
                  You already have a team for this event
                </p>
              )}
              {selectedEvent && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <UsersIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Team Size: {events.find(e => e.id === selectedEvent)?.teamSize || 4} members maximum (plus leader)
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    All teams for this event will have the same size limit as set by the admin
                  </p>
                </div>
              )}
            </div>

            {selectedEvent && !hasTeamForEvent && (
              <>
                {/* Create Team Form */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    Create New Team
                  </h4>
                  <form onSubmit={handleCreateTeam} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="teamName" className="text-sm">Team Name</Label>
                        <Input
                          id="teamName"
                          value={newTeamData.name}
                          onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter team name"
                          required
                          className="h-9 sm:h-10 text-sm mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={newTeamData.description}
                        onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your team..."
                        rows={3}
                        className="text-sm resize-none mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="visibility" className="text-sm">Visibility</Label>
                      <Select 
                        value={newTeamData.isPublic} 
                        onValueChange={(value) => setNewTeamData(prev => ({ ...prev, isPublic: value }))}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Public (Others can join)</SelectItem>
                          <SelectItem value="false">Private (Invite only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={isCreating} className="w-full h-9 sm:h-10 text-sm">
                      {isCreating ? "Creating..." : "Create Team"}
                    </Button>
                  </form>
                </div>

                <Separator />

                {/* Join Team Form */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">Join Existing Team</h4>
                  <form onSubmit={handleJoinTeam} className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="joinTeamName" className="text-sm">Team Name</Label>
                      <Input
                        id="joinTeamName"
                        value={joinTeamName}
                        onChange={(e) => setJoinTeamName(e.target.value)}
                        placeholder="Enter team name to join"
                        required
                        className="h-9 sm:h-10 text-sm mt-2"
                      />
                    </div>
                    <Button type="submit" disabled={isJoining} variant="outline" className="w-full h-9 sm:h-10 text-sm">
                      {isJoining ? "Joining..." : "Join Team"}
                    </Button>
                  </form>
                </div>
              </>
            )}

            {!selectedEvent && (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <UsersIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">Select a confirmed event to manage your team participation</p>
                <p className="text-xs mt-1">Only events with confirmed payments are shown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Teams Sidebar */}
      <div>
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Your Teams</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Teams you're leading or participating in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            {userTeams.length > 0 ? (
              userTeams.flatMap((participation: any) => {
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
              }).map((teamData: TeamData, index: number) => {
                const { participation, team, isLeader, isMember } = teamData;
                
                return (
                  <div key={`${participation.event.id}-${team.id}-${index}`} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-xs sm:text-sm truncate flex-1">{participation.event.title}</h5>
                      <Badge variant="outline" className="text-xs ml-2 shrink-0">
                        {participation.event.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {isLeader ? (
                        <CrownIcon className="w-3 h-3 text-yellow-500 shrink-0" />
                      ) : (
                        <UsersIcon className="w-3 h-3 text-blue-500 shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-medium truncate">{team.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {isLeader ? (
                        <span className="text-yellow-600">Leading {team.members?.length || 0} members • Full edit access</span>
                      ) : (
                        <span className="text-blue-600">Team member • View only access</span>
                      )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {team.slugId && (
                        <Button asChild variant="outline" size="sm" className="flex h-8 text-xs">
                          <Link href={`/dashboard/teams/${team.slugId}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      )}
                      {isLeader && team.slugId && (
                        <Button asChild variant="outline" size="sm" className="flex h-8 text-xs">
                          <Link href={`/dashboard/teams/${team.slugId}/edit`}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleLeaveTeam(participation.event.id)}
                        disabled={isLeaving}
                        className="flex h-8 text-xs"
                      >
                        <LogOutIcon className="w-3 h-3 mr-1" />
                        {isLeader ? 'Disband' : 'Leave'}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 sm:py-6 text-muted-foreground">
                <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No team participation yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}