"use client";

import { useState } from "react";
import { Plus, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementCreationForm } from "./announcement-creation-form";
import { AnnouncementsList } from "./announcements-list";

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

interface AnnouncementManagementClientProps {
  events: Event[];
  announcements: Announcement[];
}

export function AnnouncementManagementClient({ 
  events, 
  announcements: initialAnnouncements 
}: AnnouncementManagementClientProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const handleAnnouncementCreated = () => {
    // Refresh announcements list
    refreshAnnouncements();
    // Switch to list tab
    setActiveTab("list");
  };

  const refreshAnnouncements = async () => {
    // In a real app, you'd call the API to refresh the list
    // For now, we'll just trigger a page refresh
    window.location.reload();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setActiveTab("create");
  };

  const handleCancelEdit = () => {
    setEditingAnnouncement(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Announcement Management</h1>
        <p className="text-muted-foreground">
          Create, manage and organize your announcements from one central location.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Announcements ({announcements.length})
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {editingAnnouncement ? 'Edit' : 'Create New'}
            </TabsTrigger>
          </TabsList>

          {activeTab === "list" && (
            <Button onClick={() => setActiveTab("create")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Announcement
            </Button>
          )}
        </div>

        <TabsContent value="list" className="space-y-6">
          <AnnouncementsList
            announcements={announcements}
            onEdit={handleEdit}
            onRefresh={refreshAnnouncements}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <div className="space-y-4">
            {editingAnnouncement && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Editing Announcement</h3>
                    <p className="text-sm text-blue-700">You are editing "{editingAnnouncement.title}"</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              </div>
            )}
            
            <AnnouncementCreationForm
              events={events}
              onSuccess={handleAnnouncementCreated}
              editingAnnouncement={editingAnnouncement}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}