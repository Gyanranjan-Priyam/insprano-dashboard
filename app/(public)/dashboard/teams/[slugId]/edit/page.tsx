import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import EditTeamForm from "./";

interface PageProps {
  params: Promise<{
    slugId: string;
  }>;
}

export default async function EditTeamPage({ params }: PageProps) {
  const { slugId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Find the team and verify the user is the leader
  const team = await prisma.team.findUnique({
    where: { slugId },
    include: {
      leader: {
        select: {
          userId: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
        },
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
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!team) {
    notFound();
  }

  if (team.leader.userId !== session.user.id) {
    redirect(`/dashboard/teams/${slugId}`);
  }

  // Get potential members (confirmed participants not in any team for this event)
  const potentialMembers = await prisma.participation.findMany({
    where: {
      eventId: team.event.id,
      status: "CONFIRMED",
      NOT: {
        OR: [
          {
            id: team.leaderId, // Exclude current leader
          },
          {
            teamMember: {
              some: {
                team: {
                  eventId: team.event.id,
                },
              },
            },
          },
          {
            teamLeader: {
              some: {
                eventId: team.event.id,
              },
            },
          },
        ],
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Team</h1>
          <p className="text-muted-foreground">
            Manage your team for {team.event.title}
          </p>
        </div>

        <EditTeamForm 
          team={team} 
          currentMembers={team.members}
          potentialMembers={potentialMembers}
        />
      </div>
    </div>
  );
}
