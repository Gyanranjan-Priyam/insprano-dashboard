"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, FileText, Image as ImageIcon, FileVideo, FileAudio, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Custom Dialog Component for Attachment Viewer
interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function CustomDialog({ isOpen, onClose, children, className }: CustomDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
      />
      
      {/* Dialog Content */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-background rounded-lg shadow-2xl border border-border",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "flex flex-col",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("shrink-0", className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 id="dialog-title" className={className}>
      {children}
    </h2>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      {children}
    </div>
  );
}
interface AttachmentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentKey: string;
  attachmentIndex: number;
  isImage?: boolean;
}

export function AttachmentViewer({ 
  isOpen, 
  onClose, 
  attachmentKey, 
  attachmentIndex, 
  isImage = false 
}: AttachmentViewerProps) {
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    type: string;
    extension: string;
  }>({
    name: "",
    type: "unknown",
    extension: ""
  });

  useEffect(() => {
    if (isOpen && attachmentKey) {
      fetchAttachmentUrl();
    }
  }, [isOpen, attachmentKey]);

  const fetchAttachmentUrl = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/view-announcement-attachment?key=${encodeURIComponent(attachmentKey)}&action=download`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attachment');
      }
      
      const data = await response.json();
      setAttachmentUrl(data.downloadUrl);
      
      // Extract file info from key
      const fileName = attachmentKey.split('/').pop() || `${isImage ? 'Image' : 'File'} ${attachmentIndex + 1}`;
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      let fileType = 'unknown';
      if (isImage || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        fileType = 'image';
      } else if (['pdf'].includes(extension)) {
        fileType = 'pdf';
      } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension)) {
        fileType = 'video';
      } else if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
        fileType = 'audio';
      } else if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
        fileType = 'text';
      } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
        fileType = 'document';
      }
      
      setFileInfo({
        name: fileName,
        type: fileType,
        extension: extension.toUpperCase()
      });
      
    } catch (err) {
      setError('Failed to load attachment');
      console.error('Error fetching attachment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogSize = () => {
    // Default size for unknown/loading files
    const defaultSize = "w-[600px] max-w-[90vw]";
    
    if (isLoading || error) {
      return defaultSize;
    }
    
    switch (fileInfo.type) {
      case 'image':
        return "w-auto max-w-[85vw] min-w-[500px]";
      case 'pdf':
        return "w-[900px] max-w-[95vw] min-w-[700px]";
      case 'video':
        return "w-[800px] max-w-[90vw] min-w-[600px]";
      case 'audio':
        return "w-[500px] max-w-[85vw] min-w-[400px]";
      case 'text':
        return "w-[700px] max-w-[88vw] min-w-[550px]";
      case 'document':
        return "w-[750px] max-w-[90vw] min-w-[600px]";
      default:
        return defaultSize;
    }
  };

  const getDialogHeight = () => {
    // Default height for unknown/loading files
    const defaultHeight = "h-[400px] max-h-[80vh]";
    
    if (isLoading || error) {
      return defaultHeight;
    }
    
    switch (fileInfo.type) {
      case 'image':
        return "h-auto max-h-[85vh] min-h-[300px]";
      case 'pdf':
        return "h-[90vh] min-h-[600px]";
      case 'video':
        return "h-auto max-h-[80vh] min-h-[400px]";
      case 'audio':
        return "h-[300px] max-h-[50vh]";
      case 'text':
        return "h-[70vh] max-h-[80vh] min-h-[500px]";
      case 'document':
        return "h-[75vh] max-h-[85vh] min-h-[550px]";
      default:
        return defaultHeight;
    }
  };

  const getFileIcon = () => {
    switch (fileInfo.type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <FileVideo className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const renderAttachmentContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading attachment...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <p className="text-xs text-muted-foreground">Please try again or contact support if the issue persists</p>
          </div>
          <Button onClick={fetchAttachmentUrl} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      );
    }

    switch (fileInfo.type) {
      case 'image':
        return (
          <div className="flex justify-center items-center min-h-[200px]">
            <img 
              src={attachmentUrl} 
              alt={fileInfo.name}
              className="max-w-full max-h-[calc(85vh-120px)] object-contain rounded-md shadow-sm"
              onError={() => setError('Failed to load image')}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="h-[calc(90vh-120px)]">
            <iframe 
              src={attachmentUrl}
              className="w-full h-full rounded-md border border-border"
              title={fileInfo.name}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="flex justify-center items-center">
            <video 
              controls 
              className="w-full max-h-[calc(80vh-120px)] rounded-md shadow-sm"
              src={attachmentUrl}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileAudio className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-medium text-sm">{fileInfo.name}</h3>
              <p className="text-xs text-muted-foreground">Audio File</p>
            </div>
            <audio 
              controls 
              className="w-full max-w-md"
              src={attachmentUrl}
              preload="metadata"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'text':
        return (
          <div className="h-[calc(70vh-120px)]">
            <iframe 
              src={attachmentUrl}
              className="w-full h-full rounded-md border border-border bg-background"
              title={fileInfo.name}
            />
          </div>
        );
      
      case 'document':
        return (
          <div className="h-[calc(75vh-120px)]">
            <iframe 
              src={attachmentUrl}
              className="w-full h-full rounded-md border border-border"
              title={fileInfo.name}
            />
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{fileInfo.name}</h3>
              <p className="text-sm text-muted-foreground">
                Preview not available for this file type
              </p>
              <p className="text-xs text-muted-foreground">
                File extension: {fileInfo.extension}
              </p>
            </div>
            <a 
              href={attachmentUrl} 
              download={fileInfo.name}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download File
              </Button>
            </a>
          </div>
        );
    }
  };

  return (
    <CustomDialog 
      isOpen={isOpen} 
      onClose={onClose}
      className={`${getDialogSize()} ${getDialogHeight()} overflow-hidden`}
    >
      <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getFileIcon()}
            <DialogTitle className="text-sm sm:text-base font-semibold truncate">
              {fileInfo.name || (isLoading ? 'Loading...' : 'Attachment')}
            </DialogTitle>
            {fileInfo.extension && (
              <Badge variant="secondary" className="text-xs">
                {fileInfo.extension}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {attachmentUrl && !isLoading && (
              <a 
                href={attachmentUrl} 
                download={fileInfo.name}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </a>
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </DialogHeader>
      
      <DialogContent className="p-4 sm:p-6">
        {renderAttachmentContent()}
      </DialogContent>
    </CustomDialog>
  );
}