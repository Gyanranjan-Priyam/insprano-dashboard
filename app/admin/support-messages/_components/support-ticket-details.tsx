"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Paperclip,
  FileText,
  Send,
  Loader2,
  MessageCircle,
  Shield,
  Upload,
  X,
  File,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createSupportResponse, updateSupportTicketStatus } from "../actions";

interface SupportTicketDetailsProps {
  ticket: {
    id: string;
    ticketNumber: string;
    name: string;
    email: string;
    mobileNumber?: string | null;
    whatsappNumber?: string | null;
    subject: string;
    message: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date | null;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      mobileNumber?: string | null;
      whatsappNumber?: string | null;
    };
    attachments: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      fileKey: string;
      createdAt: Date;
    }>;
    responses: Array<{
      id: string;
      message: string;
      isInternal: boolean;
      createdAt: Date;
      admin?: {
        id: string;
        name: string;
        email: string;
      } | null;
      attachments?: Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        fileKey: string;
        createdAt: Date;
      }>;
    }>;
  };
}

const responseSchema = z.object({
  message: z.string().min(10, "Response must be at least 10 characters").max(2000, "Response must be less than 2000 characters"),
  isInternal: z.boolean(),
});

const statusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

type ResponseForm = z.infer<typeof responseSchema>;
type StatusForm = z.infer<typeof statusSchema>;

const statusConfig = {
  OPEN: { label: "Open", icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100", variant: "default" as const },
  IN_PROGRESS: { label: "In Progress", icon: AlertCircle, color: "text-yellow-600", bgColor: "bg-yellow-100", variant: "secondary" as const },
  RESOLVED: { label: "Resolved", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", variant: "outline" as const },
  CLOSED: { label: "Closed", icon: XCircle, color: "text-gray-600", bgColor: "bg-gray-100", variant: "outline" as const },
};

const priorityConfig = {
  LOW: { label: "Low", variant: "outline" as const, color: "text-green-600" },
  MEDIUM: { label: "Medium", variant: "secondary" as const, color: "text-yellow-600" },
  HIGH: { label: "High", variant: "default" as const, color: "text-orange-600" },
  URGENT: { label: "Urgent", variant: "destructive" as const, color: "text-red-600" },
};

export default function SupportTicketDetails({ ticket: initialTicket }: SupportTicketDetailsProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const [isResponding, setIsResponding] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileKey: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const responseForm = useForm<ResponseForm>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
      isInternal: false,
    },
  });

  const statusForm = useForm<StatusForm>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: ticket.status,
      priority: ticket.priority,
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      fileKey: string;
    }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'support'); // Specify support attachment type

        // Upload to your upload endpoint
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push({
            fileName: result.fileName || file.name,
            fileSize: result.fileSize || file.size,
            mimeType: result.mimeType || file.type,
            fileKey: result.fileKey,
          });
        } else {
          const errorData = await response.json();
          console.error(`Failed to upload ${file.name}:`, errorData.error);
          toast.error(`Failed to upload ${file.name}: ${errorData.error}`);
        }
      }

      // Add uploaded files to attachments
      setAttachments(prev => [...prev, ...uploadedFiles]);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmitResponse: SubmitHandler<ResponseForm> = async (data) => {
    try {
      setIsResponding(true);
      const result = await createSupportResponse({
        ticketId: ticket.id,
        message: data.message,
        isInternal: data.isInternal,
        attachments: attachments,
      });

      if (result.status === "success") {
        toast.success(result.message);
        responseForm.reset();
        setAttachments([]); // Clear attachments after successful submission
        
        // Refresh ticket data would ideally happen here
        // For now, we'll add the response to the local state
        if (result.data) {
          setTicket(prev => ({
            ...prev,
            responses: [...prev.responses, result.data],
            status: prev.status === "OPEN" ? "IN_PROGRESS" : prev.status,
            updatedAt: new Date(),
          }));
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to send response:", error);
      toast.error("Failed to send response. Please try again.");
    } finally {
      setIsResponding(false);
    }
  };

  const onUpdateStatus: SubmitHandler<StatusForm> = async (data) => {
    try {
      setIsUpdatingStatus(true);
      const result = await updateSupportTicketStatus({
        ticketId: ticket.id,
        status: data.status,
        priority: data.priority,
      });

      if (result.status === "success") {
        toast.success(result.message);
        setTicket(prev => ({
          ...prev,
          status: data.status,
          priority: data.priority || prev.priority,
          updatedAt: new Date(),
          resolvedAt: data.status === "RESOLVED" ? new Date() : prev.resolvedAt,
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update ticket status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusInfo = statusConfig[ticket.status];
  const priorityInfo = priorityConfig[ticket.priority];
  const StatusIcon = statusInfo.icon;

  const publicResponses = ticket.responses.filter(r => !r.isInternal);
  const internalNotes = ticket.responses.filter(r => r.isInternal);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                  {ticket.subject}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                  <Badge variant={priorityInfo.variant}>
                    {priorityInfo.label}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{ticket.message}</p>
            </div>

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Attachments</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ticket.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 border rounded-lg text-sm hover:bg-gray-50/10 cursor-pointer"
                      onClick={() => {
                        const viewerUrl = `/file-viewer?id=${attachment.id}&type=user`;
                        window.open(viewerUrl, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');
                      }}
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)} • {attachment.mimeType}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversation ({publicResponses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {publicResponses.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No responses yet. Be the first to respond!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publicResponses.map((response) => (
                  <div key={response.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {response.admin ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {response.admin?.name || ticket.user.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {response.admin ? "Admin" : "User"}
                      </Badge>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="ml-8 p-3 bg-muted rounded-lg space-y-3">
                      <p className="whitespace-pre-wrap text-sm">{response.message}</p>
                      
                      {/* Response Attachments */}
                      {response.attachments && response.attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Attachments:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {response.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-2 p-2 border rounded-lg text-xs bg-background hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  const viewerUrl = `/file-viewer?id=${attachment.id}&type=response`;
                                  window.open(viewerUrl, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');
                                }}
                              >
                                <FileText className="h-3 w-3 text-blue-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="truncate font-medium">{attachment.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.fileSize)}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                  <Paperclip className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Internal Notes */}
        {internalNotes.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Shield className="h-5 w-5" />
                Internal Notes ({internalNotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {internalNotes.map((note) => (
                  <div key={note.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          <Shield className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{note.admin?.name}</span>
                      <Badge variant="outline" className="text-xs bg-yellow-100">
                        Internal
                      </Badge>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="ml-8 p-3 bg-yellow-100/80 rounded-lg space-y-3">
                      <p className="whitespace-pre-wrap text-sm">{note.message}</p>
                      
                      {/* Internal Note Attachments */}
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-yellow-800">Attachments:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {note.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-2 p-2 border border-yellow-300 rounded-lg text-xs bg-yellow-50"
                              >
                                <FileText className="h-3 w-3 text-yellow-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="truncate font-medium">{attachment.fileName}</p>
                                  <p className="text-xs text-yellow-600">
                                    {formatFileSize(attachment.fileSize)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Response</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...responseForm}>
              <form onSubmit={responseForm.handleSubmit(onSubmitResponse)} className="space-y-4">
                <FormField
                  control={responseForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Type your response here..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={responseForm.control}
                  name="isInternal"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Internal Note</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Internal notes are only visible to admin users and won't be sent to the customer
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Attachments (Optional)</label>
                        <p className="text-sm text-muted-foreground">
                          Add files to your response. These will be sent to the user via email.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAttachments(!showAttachments)}
                        className="text-sm"
                      >
                        {showAttachments ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Attachments
                          </>
                        ) : (
                          <>
                            <Paperclip className="h-4 w-4 mr-1" />
                            Add Attachments
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {showAttachments && (
                      <div className="mt-4 space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip,.rar"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(e.target.files);
                              }
                            }}
                            className="hidden"
                            id="response-file-upload"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="response-file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Click to upload files</p>
                              <p className="text-sm text-muted-foreground">
                                PDF, DOC, Images, ZIP (max 10MB each)
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Show uploading state */}
                        {isUploading && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading files...
                          </div>
                        )}

                        {/* Display attached files */}
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Attached Files:</p>
                            <div className="space-y-2">
                              {attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                >
                                  <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{attachment.fileName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(attachment.fileSize)} • {attachment.mimeType}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttachment(index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isResponding}>
                  {isResponding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send {responseForm.watch("isInternal") ? "Internal Note" : "Response"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 sm:space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={ticket.user.image || undefined} />
                <AvatarFallback>
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base truncate">{ticket.user.name || ticket.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Customer</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 text-xs sm:text-sm">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="break-all">{ticket.user.email || ticket.email}</span>
              </div>

              {(ticket.user.mobileNumber || ticket.mobileNumber) && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                  <span>{ticket.user.mobileNumber || ticket.mobileNumber}</span>
                </div>
              )}

              {(ticket.user.whatsappNumber || ticket.whatsappNumber) && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                  <span className="flex-1">{ticket.user.whatsappNumber || ticket.whatsappNumber}</span>
                  <Badge variant="outline" className="text-xs">WhatsApp</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Status & Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...statusForm}>
              <form onSubmit={statusForm.handleSubmit(onUpdateStatus)} className="space-y-4">
                <FormField
                  control={statusForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={statusForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Ticket"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Ticket Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
            </div>

            {ticket.resolvedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Resolved {formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}</span>
              </div>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground">
              <p>Ticket ID: {ticket.id}</p>
              <p>User ID: {ticket.user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}