"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle, 
  Paperclip,
  User,
  Calendar,
  RefreshCw,
  ExternalLink,
  FileText,
  Download,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAllSupportTickets } from "../actions";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileKey: string;
  }>;
  responses: Array<any>;
  _count: {
    responses: number;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

const statusConfig = {
  OPEN: {
    label: "Open",
    icon: Clock,
    variant: "default" as const,
    color: "text-blue-600",
  },
  IN_PROGRESS: {
    label: "In Progress", 
    icon: AlertCircle,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle,
    variant: "outline" as const,
    color: "text-green-600",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCircle,
    variant: "outline" as const,
    color: "text-gray-600",
  },
};

const priorityConfig = {
  LOW: { label: "Low", variant: "outline" as const, color: "text-green-600" },
  MEDIUM: { label: "Medium", variant: "secondary" as const, color: "text-yellow-600" },
  HIGH: { label: "High", variant: "default" as const, color: "text-orange-600" },
  URGENT: { label: "Urgent", variant: "destructive" as const, color: "text-red-600" },
};

// Modal component to display attachments with view/download options
function AttachmentsModal({ 
  isOpen,
  onClose,
  ticketNumber,
  attachments 
}: { 
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileKey: string;
  }>;
}) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const handleViewFile = (attachmentId: string) => {
    const viewerUrl = `/file-viewer?id=${attachmentId}&type=user`;
    window.open(viewerUrl, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');
  };

  const handleDownloadFile = async (attachmentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/view-attachment?attachmentId=${attachmentId}&action=download`);
      
      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }
      
      const data = await response.json();
      
      // Create download link
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = fileName;
      a.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">
              <span className="hidden sm:inline">Attachments - Ticket </span>
              <span className="sm:hidden">Files - </span>
              {ticketNumber}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
          {attachments.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Paperclip className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-sm">No attachments found for this ticket.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50/10 transition-colors gap-3"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    {getFileIcon(attachment.mimeType)}
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{attachment.fileName}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-mono text-xs truncate">{attachment.mimeType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 justify-end sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewFile(attachment.id)}
                      className="text-xs flex-1 sm:flex-none cursor-pointer"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(attachment.id, attachment.fileName)}
                      className="text-xs flex-1 sm:flex-none cursor-pointer"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to open attachment in new window
function openAttachmentViewer(attachmentId: string, type: 'user' | 'response' = 'user') {
  const url = `/file-viewer?id=${attachmentId}&type=${type}`;
  window.open(url, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');
}

export default function SupportTicketsList() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicketAttachments, setSelectedTicketAttachments] = useState<{
    ticketNumber: string;
    attachments: SupportTicket['attachments'];
  } | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const loadTickets = async (page: number = 1, status: string = "all") => {
    try {
      setRefreshing(page === 1);
      const result = await getAllSupportTickets(page, 20, status);
      
      if (result.status === "success") {
        setTickets(result.data.tickets);
        setPagination(result.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to load support tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets(1, statusFilter);
  }, [statusFilter]);

  const handleStatusFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/admin/support-messages?${params.toString()}`);
  };

  const handleRefresh = () => {
    loadTickets(currentPage, statusFilter);
  };

  const handleViewTicket = (ticketNumber: string) => {
    router.push(`/admin/support-messages/${encodeURIComponent(ticketNumber)}`);
  };

  const handlePageChange = (page: number) => {
    loadTickets(page, statusFilter);
  };

  const handleViewAttachments = (ticket: SupportTicket) => {
    setSelectedTicketAttachments({
      ticketNumber: ticket.ticketNumber,
      attachments: ticket.attachments
    });
  };

  const handleCloseAttachments = () => {
    setSelectedTicketAttachments(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-6 w-32 sm:w-40" />
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-9 w-32 sm:w-40" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 sm:w-32" />
                      <Skeleton className="h-3 w-20 sm:w-24 mt-1" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-12 sm:w-16" />
                    <Skeleton className="h-6 w-16 sm:w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl">Support Tickets</CardTitle>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2 sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>
        
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Showing {tickets.length} of {pagination.totalCount} tickets
          </div>
        )}
      </CardHeader>

      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "No support tickets have been submitted yet."
                : `No tickets with status "${statusFilter.toLowerCase().replace('_', ' ')}" found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status];
              const priorityInfo = priorityConfig[ticket.priority];
              const StatusIcon = statusInfo.icon;

              return (
                <div 
                  key={ticket.id}
                  className={`border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleViewTicket(ticket.ticketNumber)}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={ticket.user.image || undefined} />
                        <AvatarFallback>
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded shrink-0">
                            {ticket.ticketNumber}
                          </code>
                          <Badge variant={priorityInfo.variant} className="text-xs">
                            {priorityInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{ticket.user.name || ticket.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{ticket.user.email || ticket.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:flex-nowrap">
                      <Badge variant={statusInfo.variant} className="shrink-0">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{statusInfo.label}</span>
                        <span className="sm:hidden">{statusInfo.label.split(' ')[0]}</span>
                      </Badge>
                      
                      {/* View Attachments Button - only show if attachments exist */}
                      {ticket.attachments.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent ticket click when clicking button
                            handleViewAttachments(ticket);
                          }}
                          className="text-xs shrink-0"
                        >
                          <Eye className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">View Attachments</span>
                          <span className="sm:hidden">Files</span>
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm" className="shrink-0 p-1 sm:p-2">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Subject and Message Preview */}
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="font-semibold text-sm line-clamp-1">{ticket.subject}</h4>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="hidden sm:inline">Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                        <span className="sm:hidden">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                      </div>

                      {ticket._count.responses > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{ticket._count.responses} response{ticket._count.responses !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {ticket.attachments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="h-3 w-3" />
                          <span>{ticket.attachments.length} file{ticket.attachments.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Updated </span>
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="mx-1 text-muted-foreground text-xs">...</span>
                        )}
                        <Button
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 text-xs"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Attachments Modal */}
      {selectedTicketAttachments && (
        <AttachmentsModal
          isOpen={!!selectedTicketAttachments}
          onClose={handleCloseAttachments}
          ticketNumber={selectedTicketAttachments.ticketNumber}
          attachments={selectedTicketAttachments.attachments}
        />
      )}
    </Card>
  );
}