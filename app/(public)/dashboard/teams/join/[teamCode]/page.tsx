import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTeamInfoByCode } from "../../actions";
import { JoinTeamForm } from "./_components/JoinTeamForm";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, MapPin, Users, Clock, KeyRound, UserPlus } from "lucide-react";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{ teamCode: string }>;
}

const parseContent = (content: any) => {
  if (!content) {
    return {
      type: 'doc',
      content: []
    };
  }

  if (typeof content === 'object' && content !== null) {
    return content;
  }
  
  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
          return parsed;
        }
      } catch (error) {
        // If parsing fails, treat as plain text below
      }
    }

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
  
  return {
    type: 'doc',
    content: []
  };
};

function TeamInfoSkeleton() {
  return (
    <Card className="shadow-lg border-0 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-6" />
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          
          <div className="bg-muted/20 p-4 rounded-lg">
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function TeamInfo({ teamCode }: { teamCode: string }) {
  const result = await getTeamInfoByCode(teamCode);
  
  if (result.status !== "success" || !result.data) {
    notFound();
  }

  const teamInfo = result.data;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="shadow-lg border-0 backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">{teamInfo.name}</h2>
          <Badge variant="outline" className="shrink-0 self-start sm:self-auto">
            {teamInfo.currentMembers}/{teamInfo.maxMembers} Members
          </Badge>
        </div>
        
        {teamInfo.description && (
          <div className="mb-6 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <RenderDescription json={parseContent(teamInfo.description)} />
          </div>
        )}

        <div className="space-y-4">
          {/* Team Leader */}
          <div className="flex items-start gap-3 p-3 bg-linear-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Crown className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-sm">{teamInfo.leader.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{teamInfo.leader.email}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Team Leader</p>
            </div>
          </div>

          {/* Event Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100 text-sm">Event Details</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-medium text-sm text-gray-900 dark:text-white block">{teamInfo.event.title}</span>
                  <span className="text-xs text-muted-foreground">Event</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-sm text-gray-900 dark:text-white block">{formatDate(teamInfo.event.date)}</span>
                  <span className="text-xs text-muted-foreground">Date & Time</span>
                </div>
              </div>
              {teamInfo.event.venue && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-sm text-gray-900 dark:text-white block">{teamInfo.event.venue}</span>
                    <span className="text-xs text-muted-foreground">Venue</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Capacity */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {teamInfo.maxMembers - teamInfo.currentMembers} slot{teamInfo.maxMembers - teamInfo.currentMembers !== 1 ? 's' : ''} remaining
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(teamInfo.currentMembers / teamInfo.maxMembers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function JoinTeamPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { teamCode: rawTeamCode } = await params;
  const teamCode = rawTeamCode.toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex flex-col gap-1">
               <span className="font-bold text-4xl">Join Team</span>
               <span className="text-xl text-muted-foreground font-semibold mt-2 mb-2">Complete your team join request with your profile information</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                  <KeyRound className="h-4 w-4" />
                  Team Code: {teamCode}
                </span>
              </div>
              <Separator className="mt-4 mb-1" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8 animate-in fade-in duration-500">
          {/* Team Information - Left Side */}
          <div className="xl:col-span-2 space-y-6">
            <div className="sticky top-6">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Information
              </h3>
              <Suspense fallback={<TeamInfoSkeleton />}>
                <TeamInfo teamCode={teamCode} />
              </Suspense>
            </div>
          </div>

          {/* Join Form - Right Side */}
          <div className="xl:col-span-3 space-y-6">
            <h3 className="text-lg lg:text-xl font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Your Information
            </h3>
            <Suspense fallback={
              <Card className="shadow-lg border-0">
                <CardContent className="p-6 lg:p-8 space-y-6">
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-3">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </CardContent>
              </Card>
            }>
              <JoinTeamForm teamCode={teamCode} userId={session.user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}