# Dynamic Navigation Components

This documentation explains the dynamic back button and navigation components that have been implemented across the application.

## Components Overview

### 1. Enhanced SiteHeader (`components/public_components/site-header.tsx`)

The site header now includes:
- **Dynamic Page Titles**: Automatically generates page titles based on the current route
- **Smart Back Button**: Shows back button on detail pages, hides on main dashboard pages
- **Route-aware Logic**: Understands your application structure

**Features:**
- Automatically detects admin vs user routes
- Shows contextual page titles (e.g., "Accommodation Payment Details", "Edit Booking")
- Conditionally displays back button based on page depth

### 2. BackButton (`components/ui/back-button.tsx`)

A compact back button for use in headers and small spaces.

```tsx
import { BackButton } from "@/components/ui/back-button";

<BackButton 
  fallbackUrl="/dashboard"
  label="Back"
  variant="ghost"
  size="sm"
/>
```

**Props:**
- `fallbackUrl`: URL to navigate to if no browser history
- `label`: Button text (default: "Back")
- `variant`: Button style variant
- `size`: Button size
- `className`: Additional CSS classes

### 3. PageBackButton (`components/ui/page-back-button.tsx`)

A full-featured back button for use in page content.

```tsx
import { PageBackButton } from "@/components/ui/page-back-button";

<PageBackButton 
  fallbackUrl="/dashboard"
  label="Go Back"
  showIcon={true}
  iconType="chevron"
  variant="outline"
/>
```

**Props:**
- `fallbackUrl`: URL to navigate to if no browser history (default: "/dashboard")
- `label`: Button text (default: "Go Back")
- `showIcon`: Whether to show icon (default: true)
- `iconType`: "chevron" or "arrow" (default: "chevron")
- `variant`: Button style variant (default: "outline")
- `onClick`: Custom click handler

### 4. DynamicBreadcrumb (`components/ui/dynamic-breadcrumb.tsx`)

Automatically generates breadcrumbs based on the current route.

```tsx
import { DynamicBreadcrumb } from "@/components/ui/dynamic-breadcrumb";

<DynamicBreadcrumb 
  homeUrl="/dashboard"
  homeLabel="Home"
/>
```

**Props:**
- `homeUrl`: URL for the home/root breadcrumb (default: "/dashboard")
- `homeLabel`: Label for the home breadcrumb (default: "Home")
- `className`: Additional CSS classes

**Features:**
- Automatically truncates long IDs
- Provides meaningful labels for known routes
- Shows home icon for the root breadcrumb

### 5. PageHeader (`components/ui/page-header.tsx`)

A comprehensive page header that combines title, description, back button, and breadcrumbs.

```tsx
import { PageHeader } from "@/components/ui/page-header";

<PageHeader
  title="Edit Accommodation Booking"
  description="Modify your reservation details"
  showBackButton={true}
  showBreadcrumbs={true}
  backButtonProps={{
    fallbackUrl: "/dashboard/accommodations",
    label: "Back to Bookings"
  }}
>
  {/* Optional action buttons */}
  <Button>Save Changes</Button>
</PageHeader>
```

**Props:**
- `title`: Page title (optional)
- `description`: Page description (optional)
- `showBackButton`: Whether to show back button (default: true)
- `showBreadcrumbs`: Whether to show breadcrumbs (default: false)
- `backButtonProps`: Props to pass to the back button
- `children`: Additional content (usually action buttons)
- `className`: Additional CSS classes

## Usage Examples

### Simple Page with Back Button

```tsx
export default function DetailPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Page Title"
        description="Page description"
        backButtonProps={{
          fallbackUrl: "/dashboard",
          label: "Back to Dashboard"
        }}
      />
      
      {/* Page content */}
    </div>
  );
}
```

### Page with Breadcrumbs and Actions

```tsx
export default function EditPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Edit Item"
        description="Make changes to your item"
        showBreadcrumbs={true}
        backButtonProps={{
          fallbackUrl: "/items",
          label: "Back to Items"
        }}
      >
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </PageHeader>
      
      {/* Page content */}
    </div>
  );
}
```

### Custom Back Button in Content

```tsx
export default function CustomPage() {
  return (
    <div className="space-y-6">
      <PageBackButton 
        fallbackUrl="/custom-route"
        label="Return to Previous Page"
        iconType="arrow"
        onClick={() => {
          // Custom logic before navigation
          console.log("Navigating back...");
        }}
      />
      
      {/* Page content */}
    </div>
  );
}
```

## How Navigation Works

### Browser History Detection
The components intelligently handle navigation:
1. **First Priority**: Use `router.back()` if browser history exists
2. **Fallback**: Navigate to the specified `fallbackUrl` if no history

### Dynamic Titles
The SiteHeader automatically generates titles based on URL patterns:
- `/admin/payments/accommodation-payments/[id]` → "Accommodation Payment Details"
- `/dashboard/accommodations/[userId]/edit` → "Edit Accommodation Booking"
- `/admin/events` → "Events Management"

### Smart Back Button Display
The header back button appears when:
- Not on main dashboard pages (`/dashboard`, `/admin`)
- On detail or edit pages
- On nested routes

## Migration Guide

### Replacing Existing Headers

**Before:**
```tsx
<div className="mb-8">
  <Link href="/back-url">
    <Button variant="outline">Back</Button>
  </Link>
  <h1 className="text-2xl font-bold">Page Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**After:**
```tsx
<PageHeader
  title="Page Title"
  description="Description"
  backButtonProps={{
    fallbackUrl: "/back-url",
    label: "Back"
  }}
/>
```

### Benefits

1. **Consistency**: All pages use the same navigation patterns
2. **Smart Navigation**: Handles browser history automatically
3. **Responsive**: Components work well on all screen sizes
4. **Accessible**: Proper keyboard navigation and ARIA labels
5. **Customizable**: Flexible props for different use cases
6. **Automatic**: Header titles and back button behavior is mostly automatic

## Configuration

The components use these defaults that can be customized:
- Default fallback URL: `/dashboard`
- Default home URL for breadcrumbs: `/dashboard`
- Default button variants and sizes
- Automatic route-based title generation

All components are fully TypeScript typed for better development experience.