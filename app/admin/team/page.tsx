import { getAllTeams, getTeamStatistics, getEventCategories } from "./actions";
import TeamsPageClient from "./_components/teams-client";

export default async function TeamAdminPage() {
  const [teamsResult, statisticsResult, categoriesResult] = await Promise.all([
    getAllTeams(),
    getTeamStatistics(),
    getEventCategories()
  ]);

  if (teamsResult.status === "error") {
    return <TeamsPageClient teams={[]} categories={[]} statistics={{
      totalTeams: 0,
      teamsWithMembers: 0,
      totalMembers: 0,
      pendingRequests: 0
    }} error={teamsResult.message} />;
  }

  if (statisticsResult.status === "error") {
    return <TeamsPageClient teams={teamsResult.data || []} categories={[]} statistics={{
      totalTeams: 0,
      teamsWithMembers: 0,
      totalMembers: 0,
      pendingRequests: 0
    }} error={statisticsResult.message} />;
  }

  if (categoriesResult.status === "error") {
    return <TeamsPageClient teams={teamsResult.data || []} categories={[]} statistics={statisticsResult.data || {
      totalTeams: 0,
      teamsWithMembers: 0,
      totalMembers: 0,
      pendingRequests: 0
    }} error={categoriesResult.message} />;
  }

  return (
    <TeamsPageClient 
      teams={teamsResult.data || []} 
      categories={categoriesResult.data || []}
      statistics={statisticsResult.data || {
        totalTeams: 0,
        teamsWithMembers: 0,
        totalMembers: 0,
        pendingRequests: 0
      }}
    />
  );
}