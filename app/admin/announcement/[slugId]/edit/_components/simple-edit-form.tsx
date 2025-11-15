"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAnnouncement, deleteAnnouncement } from "../../../action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin_components/rich-text-editor/Editor";
import { MultipleUploader } from "@/components/file-uploader/MultipleUploader";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

interface AnnouncementEditFormProps {
  announcement: any;
  events: any[];
}

export default function AnnouncementEditForm({ announcement, events }: AnnouncementEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(announcement.title);
  const [description, setDescription] = useState(announcement.description);
  const [category, setCategory] = useState(announcement.category);
  const [priority, setPriority] = useState(announcement.priority);
  const [audience, setAudience] = useState(announcement.audience);
  const [relatedEventId, setRelatedEventId] = useState(announcement.relatedEventId || "");
  const [attachmentKeys, setAttachmentKeys] = useState(announcement.attachmentKeys || []);
  const [imageKeys, setImageKeys] = useState(announcement.imageKeys || []);
  const [isPinned, setIsPinned] = useState(announcement.isPinned);
  const [showInHomeBanner, setShowInHomeBanner] = useState(announcement.showInHomeBanner);
  const [sendNotifications, setSendNotifications] = useState(announcement.sendNotifications);
  const [publishDate, setPublishDate] = useState(
    new Date(announcement.publishDate).toISOString().slice(0, 16)
  );
  const [expiryDate, setExpiryDate] = useState(
    announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().slice(0, 16) : ""
  );

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        title,
        description,
        category,
        priority,
        audience,
        relatedEventId: relatedEventId || null,
        attachmentKeys,
        imageKeys,
        isPinned,
        showInHomeBanner,
        sendNotifications,
        publishDate: new Date(publishDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isRecurring: announcement.isRecurring,
        recurrenceType: announcement.recurrenceType,
        recurrenceInterval: announcement.recurrenceInterval,
      };

      const result = await updateAnnouncement(announcement.id, formData);
      
      if (result.success) {
        toast.success(result.message);
        router.push("/admin/announcement");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to update announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAnnouncement(announcement.id);
      
      if (result.success) {
        toast.success(result.message);
        router.push("/admin/announcement");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete announcement");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <RichTextEditor 
                field={{
                  value: description,
                  onChange: setDescription
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="GENERAL">General</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="EVENT_UPDATE">Event Update</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="LOGISTICS">Logistics</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="URGENT">Urgent</option>
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Members Only</option>
                <option value="TEAM_LEADERS">Team Leaders</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Related Event (Optional)</label>
              <select
                value={relatedEventId}
                onChange={(e) => setRelatedEventId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">No related event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Uploads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Attachments (Optional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload documents, PDFs, or other files (Max 10 files, 10MB each)
              </p>
              <MultipleUploader
                onChange={setAttachmentKeys}
                value={attachmentKeys}
                maxFiles={10}
                minFiles={0}
              />
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium">Images (Optional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload images, posters, or visual elements (Max 5 images, 5MB each)
              </p>
              <MultipleUploader
                onChange={setImageKeys}
                value={imageKeys}
                maxFiles={5}
                minFiles={0}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              <label htmlFor="isPinned" className="text-sm font-medium">
                Pin Announcement
              </label>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showInHomeBanner"
                checked={showInHomeBanner}
                onChange={(e) => setShowInHomeBanner(e.target.checked)}
              />
              <label htmlFor="showInHomeBanner" className="text-sm font-medium">
                Show in Home Banner
              </label>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendNotifications"
                checked={sendNotifications}
                onChange={(e) => setSendNotifications(e.target.checked)}
              />
              <label htmlFor="sendNotifications" className="text-sm font-medium">
                Send Notifications
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Publish Date</label>
                <Input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Expiry Date (Optional)</label>
                <Input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between space-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Announcement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the announcement
                  "{announcement.title}" and remove all its data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                "Updating..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Announcement
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}