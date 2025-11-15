"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, KeyRound, Search } from "lucide-react";
import { getTeamInfoByCode } from "../actions";
import { useRouter } from "next/navigation";

export function JoinByCodeForm() {
  const router = useRouter();
  const [teamCode, setTeamCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      toast.error("Please enter a team code");
      return;
    }

    setIsSearching(true);
    try {
      const result = await getTeamInfoByCode(teamCode.trim().toUpperCase());
      
      if (result.status === "success") {
        // Redirect to the new join page instead of showing popup
        toast.success("Team found! Redirecting to join form...");
        router.push(`/dashboard/teams/join/${teamCode.trim().toUpperCase()}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to find team");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
          Join Team by Code
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter a team code to find and join an existing team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        <form onSubmit={handleSearchTeam} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamCode" className="text-sm sm:text-base">Team Code</Label>
            <Input
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character team code"
              maxLength={6}
              className="font-mono tracking-wider text-center h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSearching || !teamCode.trim()}
            className="w-full h-9 sm:h-10 text-sm sm:text-base cursor-pointer"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-2 cursor-pointer" />
            {isSearching ? "Finding Team..." : "Find Team"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}