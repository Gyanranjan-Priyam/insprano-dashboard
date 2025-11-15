"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadIcon, SaveIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ReuploadDialogProps {
  participationId: string;
  participantName: string;
  eventTitle: string;
}

export function ReuploadDialog({ participationId, participantName, eventTitle }: ReuploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPG, PNG)');
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a payment screenshot first");
      return;
    }

    startTransition(async () => {
      setUploading(true);
      try {
        // First get pre-signed URL from S3
        const preSignedResponse = await fetch('/api/s3/payment-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        const preSignedResult = await preSignedResponse.json();

        if (!preSignedResponse.ok || preSignedResult.error) {
          throw new Error(preSignedResult.error || 'Failed to get upload URL');
        }

        // Upload file to S3 using pre-signed URL
        const uploadResponse = await fetch(preSignedResult.preSignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to S3');
        }

        // Then update the participation with the new file key
        const updateResponse = await fetch('/api/reupload-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participationId,
            paymentScreenshotKey: preSignedResult.key,
          }),
        });

        const updateResult = await updateResponse.json();

        if (updateResponse.ok && updateResult.success) {
          toast.success("Payment screenshot reuploaded successfully");
          setOpen(false);
          setFile(null);
          router.refresh();
        } else {
          toast.error(updateResult.message || "Failed to update payment screenshot");
        }
      } catch (error) {
        console.error("Reupload error:", error);
        toast.error("Failed to reupload payment screenshot");
      } finally {
        setUploading(false);
      }
    });
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
          <UploadIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Reupload Payment Screenshot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md mx-4">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">Reupload Payment Screenshot</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Upload a new payment screenshot for <strong>{participantName}</strong> in <strong>{eventTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Payment Screenshot
            </label>
            
            {!file ? (
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <UploadIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Click to upload payment screenshot</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleFileChange}
                      disabled={uploading || pending}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading || pending}
                      className="h-8 sm:h-9 text-sm"
                    >
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={uploading || pending}
                      className="h-8 text-sm shrink-0"
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Upload a clear image of your payment confirmation
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
            <Button
              onClick={handleUpload}
              disabled={uploading || pending || !file}
              className="flex-1 h-9 sm:h-10 text-sm"
            >
              {uploading || pending ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <SaveIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Save Screenshot
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFile(null);
              }}
              disabled={uploading || pending}
              className="h-9 sm:h-10 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}