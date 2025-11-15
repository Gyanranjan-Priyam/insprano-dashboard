"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinTeamButtonProps {
  teamSlugId: string;
  teamName: string;
  teamCode?: string;
}

export function JoinTeamButton({ teamSlugId, teamName, teamCode }: JoinTeamButtonProps) {
  const router = useRouter();

  const handleJoinTeam = () => {
    if (teamCode) {
      router.push(`/dashboard/teams/join/${teamCode}`);
    } else {
      router.push(`/dashboard/teams`);
    }
  };

  if (!teamCode) {
    return (
      <Button variant="outline" disabled>
        <UserPlus className="h-4 w-4 mr-2" />
        No Team Code
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleJoinTeam}>
      <UserPlus className="h-4 w-4 mr-2" />
      Join Team
    </Button>
  );
}