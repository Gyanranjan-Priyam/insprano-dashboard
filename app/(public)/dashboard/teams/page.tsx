import { Suspense } from "react";
import { getUserTeams, getUserEvents, getAvailableTeams } from "./actions";
import { TeamsTabs } from "./_components/teams-tabs";

export default async function TeamsPage() {
  const [userTeamsResult, userEventsResult, availableTeamsResult] = await Promise.all([
    getUserTeams(),
    getUserEvents(),
    getAvailableTeams()
  ]);

  if (userTeamsResult.status === "error" || userEventsResult.status === "error" || availableTeamsResult.status === "error") {
    return (
      <div className="container mx-auto py-4 sm:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Teams</h1>
          <div className="text-red-600 text-sm sm:text-base">
            {userTeamsResult.message || userEventsResult.message || availableTeamsResult.message}
          </div>
        </div>
      </div>
    );
  }

  const userTeams = userTeamsResult.data || [];
  const userEvents = userEventsResult.data || [];
  const availableTeams = availableTeamsResult.data || [];

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Teams</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Create or join teams for your registered events
        </p>
      </div>

      <Suspense fallback={<div>Loading teams...</div>}>
        <TeamsTabs 
          userTeams={userTeams}
          userEvents={userEvents}
          availableTeams={availableTeams}
        />
      </Suspense>
    </div>
  );
}
