"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { createStay } from "../actions";
import { toast } from "sonner";
import { MultipleUploader } from "@/components/file-uploader/MultipleUploader";

interface CreateStayDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStayDialog({ isOpen, onClose }: CreateStayDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    place: "",
    roomPrice: "",
    imageKey: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.place || !formData.roomPrice || !formData.imageKey) {
      toast.error("Please fill all fields and upload an image");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createStay({
        place: formData.place,
        roomPrice: parseInt(formData.roomPrice),
        imageKey: formData.imageKey,
      });

      if (result.status === "success") {
        toast.success("Stay created successfully");
        onClose();
        setFormData({ place: "", roomPrice: "", imageKey: "" });
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create stay");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stay</DialogTitle>
          <DialogDescription>
            Create a new stay accommodation option
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="place">Place</Label>
            <Input
              id="place"
              value={formData.place}
              onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
              placeholder="Enter location/place name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomPrice">Room Price (₹)</Label>
            <Input
              id="roomPrice"
              type="number"
              value={formData.roomPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, roomPrice: e.target.value }))}
              placeholder="Enter price per room"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Stay Image</Label>
            <MultipleUploader
              value={formData.imageKey ? [formData.imageKey] : []}
              onChange={(keys) => setFormData(prev => ({ ...prev, imageKey: keys[0] || "" }))}
              maxFiles={1}
              minFiles={1}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Stay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}