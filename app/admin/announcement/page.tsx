import { Suspense } from "react";
import { getEventsForAnnouncements, getAnnouncements } from "./action";
import { Loader2 } from "lucide-react";
import { AnnouncementManagementWrapper } from "./_components/announcement-management-wrapper";

async function AnnouncementPageContent() {
  try {
    const [events, announcements] = await Promise.all([
      getEventsForAnnouncements(),
      getAnnouncements()
    ]);
    
    return (
      <div className="container mx-auto py-4 sm:py-6 px-4">
        <AnnouncementManagementWrapper events={events} announcements={announcements} />
      </div>
    );
  } catch (error) {
    console.error("Error loading announcement page:", error);
    return (
      <div className="container mx-auto py-4 sm:py-6 px-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Page</h1>
          <p className="text-muted-foreground">
            There was a problem loading the announcement management page. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export default function AdminAnnouncementPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-4 sm:py-6 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading announcement management...</span>
          </div>
        </div>
      }
    >
      <AnnouncementPageContent />
    </Suspense>
  );
}