"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, SearchIcon, KeyRound, Heart } from "lucide-react";
import { TeamManagementForm } from "./team-management-form";
import { AvailableTeams } from "./available-teams";
import { JoinByCodeForm } from "./join-by-code-form";
import { MyTeamsTab } from "./my-teams-tab";
import { QuickJoinFAB } from "./quick-join-fab";

interface TeamsTabsProps {
  userTeams: any[];
  userEvents: any[];
  availableTeams: any[];
}

export function TeamsTabs({ userTeams, userEvents, availableTeams }: TeamsTabsProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("my-teams");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["my-teams", "manage", "discover", "join-code"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-full sm:max-w-2xl h-auto">
          <TabsTrigger value="my-teams" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">My Teams</span>
            <span className="sm:hidden">My Teams</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Manage Teams</span>
            <span className="sm:hidden">Manage</span>
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <SearchIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Discover Teams</span>
            <span className="sm:hidden">Discover</span>
          </TabsTrigger>
          <TabsTrigger value="join-code" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <KeyRound className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Join by Code</span>
            <span className="sm:hidden">Code</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-teams" className="space-y-4 sm:space-y-6">
          <MyTeamsTab userTeams={userTeams} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4 sm:space-y-6">
          {userEvents.length > 0 ? (
            <TeamManagementForm events={userEvents} userTeams={userTeams} />
          ) : (
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  No Confirmed Events Found
                </CardTitle>
                <CardDescription className="text-sm">
                  You need to register for events with confirmed payment to create or manage teams
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  Register for events in the events section and complete payment to unlock team management features.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4 sm:space-y-6">
          <AvailableTeams teams={availableTeams} />
        </TabsContent>

        <TabsContent value="join-code" className="space-y-4 sm:space-y-6">
          <div className="max-w-full sm:max-w-md mx-auto">
            <JoinByCodeForm />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quick Join FAB for easy access */}
      <QuickJoinFAB />
    </>
  );
}