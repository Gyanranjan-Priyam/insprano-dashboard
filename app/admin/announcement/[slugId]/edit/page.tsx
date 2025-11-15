import { notFound } from "next/navigation";
import { getAnnouncementBySlugId, getEventsForAnnouncements } from "../../action";
import SimpleEditForm from "./_components/simple-edit-form";
import { AdminProtected } from "@/components/admin_components/AdminProtected";

interface EditAnnouncementPageProps {
  params: Promise<{
    slugId: string;
  }>;
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    const { slugId } = resolvedParams;

    // Validate slugId
    if (!slugId) {
      console.error("No slugId provided");
      notFound();
    }

    // Fetch the announcement data
    const announcement = await getAnnouncementBySlugId(slugId);
    
    if (!announcement) {
      notFound();
    }

    // Fetch available events for the form
    const events = await getEventsForAnnouncements();

    return (
      <AdminProtected>
        <div className="flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold">Edit Announcement</h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                    Update announcement details and settings
                  </p>
                  <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Announcement ID:</span>
                    <span className="text-xs sm:text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {announcement.slugId}
                    </span>
                  </div>
                </div>

                <SimpleEditForm 
                  announcement={announcement}
                  events={events}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminProtected>
    );
  } catch (error) {
    console.error("Error loading announcement for edit:", error);
    
    return (
      <AdminProtected>
        <div className="flex h-screen overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-6 sm:py-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">Error Loading Announcement</h1>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    {error instanceof Error && error.message.includes("Database is currently unavailable") 
                      ? "Database is currently unavailable. Please try again later."
                      : "There was a problem loading this announcement. It may not exist or you may not have permission to edit it."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminProtected>
    );
  }
}