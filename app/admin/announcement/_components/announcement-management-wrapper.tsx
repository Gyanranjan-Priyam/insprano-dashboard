"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, List } from "lucide-react";
import { AnnouncementCreationForm } from "./announcement-creation-form";
import { AnnouncementsList } from "./announcements-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: string;
  title: string;
  date: Date;
  slugId: string;
}

interface Announcement {
  id: string;
  slugId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  audience: string;
  publishDate: Date;
  expiryDate?: Date | null;
  isPinned: boolean;
  showInHomeBanner: boolean;
  isRecurring: boolean;
  createdAt: Date;
  relatedEvent?: {
    id: string;
    title: string;
    slugId: string;
  } | null;
}

interface AnnouncementManagementWrapperProps {
  events: Event[];
  announcements: Announcement[];
}

export function AnnouncementManagementWrapper({ events, announcements }: AnnouncementManagementWrapperProps) {
  const [currentTab, setCurrentTab] = useState("list");
  const router = useRouter();

  const handleAnnouncementSuccess = () => {
    // Switch to list tab after successful creation
    setCurrentTab("list");
    // Refresh the page to show the new announcement
    window.location.reload();
  };

  const handleEdit = (announcement: Announcement) => {
    // Navigate to the edit page using the slugId
    router.push(`/admin/announcement/${announcement.slugId}/edit`);
  };

  const handleRefresh = () => {
    // Refresh the page to reload announcements
    window.location.reload();
  };

  return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Announcement Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create, manage and organize your announcements from one central location.
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-2 h-auto">
            <TabsTrigger value="list" className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2">
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Announcements</span>
              <span className="xs:hidden">List</span>
              <span className="ml-1">({announcements.length})</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Create New</span>
              <span className="xs:hidden">Create</span>
            </TabsTrigger>
          </TabsList>        <TabsContent value="list" className="space-y-6">
          <AnnouncementsList 
            announcements={announcements} 
            onEdit={handleEdit}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <AnnouncementCreationForm 
            events={events} 
            onSuccess={handleAnnouncementSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}