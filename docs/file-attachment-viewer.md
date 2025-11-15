# File Attachment Viewer System

## Overview

The support ticket system now includes a comprehensive file attachment viewing system that allows administrators to view attachments in proper viewers (PDF viewer, image viewer, etc.) in new browser windows/tabs.

## Features

### 1. File Viewer (`/file-viewer`)
- **Purpose**: View individual files in new windows with proper viewers
- **Supported File Types**:
  - **Images**: PNG, JPG, JPEG, GIF, SVG - displayed with native image viewer
  - **PDFs**: Displayed using browser's built-in PDF viewer with iframe
  - **Text Files**: Displayed in iframe with proper formatting
  - **Other Files**: Download option with external link capability

### 2. Attachment List Viewer (`/attachment-list`)
- **Purpose**: Display list of all attachments for a ticket with individual view/download options
- **Features**:
  - File type badges (Image, PDF, Video, Audio, Text, File)
  - File size formatting
  - MIME type display
  - Individual view and download buttons
  - Total file size calculation

### 3. API Endpoints

#### `/api/view-attachment`
- **Purpose**: Handle user-uploaded attachments (SupportAttachment model)
- **Parameters**:
  - `attachmentId`: ID of the attachment
  - `action`: 'view' (redirect to S3 URL) or 'download' (return JSON with URL)

#### `/api/view-response-attachment`
- **Purpose**: Handle admin response attachments (SupportResponseAttachment model)
- **Parameters**: Same as above but for response attachments

## Implementation Details

### Support Tickets List
- **View Attachments Button**: Only shown when attachments exist
- **Functionality**: Opens attachment list in new window (800x600px)
- **URL Format**: `/attachment-list?ticketNumber={ticket}&attachments={encoded_json}`

### Ticket Details Page
- **User Attachments**: Clickable cards that open individual files in new windows
- **Admin Response Attachments**: Same clickable functionality for response files
- **Visual Indicators**: Blue file icons and hover effects

### File Viewing Experience
1. **Click attachment** → Opens in new window (1200x800px)
2. **PDF files** → Browser's native PDF viewer
3. **Images** → Native image display with zoom/pan
4. **Text files** → Formatted text viewer
5. **Unsupported files** → Download option with external link

## Security Features

- **S3 Presigned URLs**: 1-hour expiry for secure access
- **Database Validation**: Attachment existence verified before serving
- **Error Handling**: Proper error messages for missing/invalid files

## Browser Support

- Works in all modern browsers
- PDF viewing requires browser PDF support (available in Chrome, Firefox, Safari, Edge)
- Image viewing uses native browser capabilities
- Popup blocker bypass through user interaction

## Usage Examples

### View Single File
```typescript
const openFileViewer = (attachmentId: string, type: 'user' | 'response') => {
  const url = `/file-viewer?id=${attachmentId}&type=${type}`;
  window.open(url, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');
};
```

### View All Ticket Attachments
```typescript
const openAttachmentList = (ticketNumber: string, attachments: Attachment[]) => {
  const url = `/attachment-list?ticketNumber=${encodeURIComponent(ticketNumber)}&attachments=${encodeURIComponent(JSON.stringify(attachments))}`;
  window.open(url, '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
};
```

## File Size Formatting

The system includes a utility function for human-readable file sizes:
```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
```

## Error Handling

- **Missing attachments**: User-friendly error messages
- **S3 errors**: Graceful fallback with retry options
- **Invalid URLs**: Proper 404 handling
- **Network issues**: Loading states and error boundaries

## Performance Considerations

- **Lazy loading**: Files only loaded when accessed
- **Presigned URLs**: Efficient S3 access without server proxy
- **Window management**: Proper cleanup and memory management
- **Responsive design**: Works on mobile and desktop devices