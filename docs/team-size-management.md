# Team Size Management Feature

## Overview
The team size management feature allows administrators to configure maximum team member limits per event, providing better control over team participation and event logistics.

## Key Changes Made

### 1. Database Schema Updates
- **Event Model**: Added `teamSize` field (Int, optional, default: 4)
  - Range: 1-20 members
  - Controls maximum team size for all teams in this event

### 2. Admin Interface Updates
- **Create Event Form**: Added team size configuration field
- **Edit Event Form**: Added team size editing capability
- **Event Display**: Shows team size information in admin event view

### 3. Team Management Updates
- **Team Creation**: Now uses event's `teamSize` instead of user-defined `maxMembers`
- **Team Edit Form**: Removed `maxMembers` field (now controlled by event admin)
- **Team Actions**: Updated to respect event-defined team limits

### 4. Public Interface Updates
- **Event Pages**: Display team size information to users
- **Team Forms**: Simplified to remove manual team size selection

## Migration Notes

### Existing Data
- Existing events will have `teamSize` set to 4 (default)
- Existing teams keep their current `maxMembers` values
- New teams automatically use the event's `teamSize` setting

### Database Migration Required
Run the following command to apply schema changes:
```bash
npx prisma db push
```

## Configuration Details

### Team Size Validation
- **Minimum**: 1 member
- **Maximum**: 20 members  
- **Default**: 4 members
- **Scope**: Per event (all teams in an event have the same max size)

### Admin Controls
- Set team size when creating events
- Modify team size when editing events
- Team size applies to all teams in that event
- Cannot reduce team size below existing team member counts

### User Experience
- Users see team size during event registration
- Team creation forms no longer allow size customization
- Team size is displayed clearly on event pages
- Existing teams continue with their current size limits

## File Changes Summary

### Schema & Validation
- `prisma/schema.prisma`: Added `teamSize` to Event model
- `lib/zodSchema.ts`: Added team size validation

### Admin Interface
- `app/admin/events/create/page.tsx`: Added team size field
- `app/admin/events/create/action.ts`: Include teamSize in creation
- `app/admin/events/[slugId]/edit/page.tsx`: Added team size editing
- `app/admin/events/[slugId]/edit/action.ts`: Include teamSize in updates
- `app/admin/events/[slugId]/page.tsx`: Display team size info

### Team Management
- `app/(public)/dashboard/teams/actions.ts`: Updated team creation logic
- `app/(public)/dashboard/teams/_components/team-management-form.tsx`: Removed maxMembers field
- `app/(public)/dashboard/teams/[slugId]/edit/EditTeamForm.tsx`: Removed maxMembers editing

### Public Interface
- `app/(public)/events/[slugId]/_components/animated-event-page.tsx`: Display team size

## Usage Examples

### Creating an Event with Team Size
1. Go to Admin → Events → Create
2. Fill event details
3. Set "Team Size" to desired number (1-20)
4. Save event

### Modifying Team Size
1. Go to Admin → Events → [Event] → Edit
2. Change "Team Size" field
3. Save changes
4. All new teams will use the updated size

### User Team Creation
1. Users see event team size on event page
2. Team creation automatically uses event's team size
3. Users cannot override the admin-set team size

## Benefits

1. **Administrative Control**: Admins have centralized control over team sizes
2. **Event Consistency**: All teams in an event have the same size limit
3. **Simplified UX**: Users don't need to decide team size
4. **Better Planning**: Event organizers can plan based on known team sizes
5. **Flexibility**: Different events can have different team size requirements

## Future Enhancements

- Team size templates for common event types
- Bulk team size updates across multiple events
- Team size history and analytics
- Custom team size per event category