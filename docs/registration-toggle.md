# Registration Toggle Feature

This feature allows administrators to enable or disable user registration system-wide.

## How it works

### Admin Settings Page
- Located at `/admin/settings`
- Contains a toggle switch labeled "Enable User Registration"
- When enabled: Users can access registration pages and participate in events
- When disabled: Users are redirected to a thank you page instead

### Protected Routes
The following routes check registration status:
- `/register` - Main registration page
- `/dashboard/participate` - User participation page
- Any route containing "register" or "participate"

### Database
- Uses `SystemSettings` model in Prisma schema
- Key: `registration_enabled`
- Value: `"true"` or `"false"`
- Auto-creates default setting (enabled) if not found

### Components

#### RegistrationToggle Component
- File: `app/admin/settings/_components/registration-toggle.tsx`
- Client-side toggle with real-time updates
- Shows success/error toasts
- Automatically reverts on failure

#### Thank You Page
- File: `app/thank-you/page.tsx`
- Shown when registration is disabled
- Professional message with contact information
- Links to social media and home page

### Server Actions

#### Registration Settings
- `getRegistrationSetting()` - Fetches current setting
- `updateRegistrationSetting(enabled: boolean)` - Updates setting (admin only)

#### Utility Functions
- `isRegistrationEnabled()` - Checks if registration is enabled
- `getSystemSetting(key, defaultValue)` - Generic system setting getter

### Usage Examples

```typescript
// Check registration status in a page
import { isRegistrationEnabled } from '@/lib/system-settings';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const registrationEnabled = await isRegistrationEnabled();
  
  if (!registrationEnabled) {
    redirect('/thank-you');
  }
  
  // Rest of your page...
}
```

```typescript
// Update registration setting (admin only)
import { updateRegistrationSetting } from '@/app/admin/settings/actions';

const result = await updateRegistrationSetting(false); // Disable registration
if (result.status === 'success') {
  console.log('Registration disabled');
}
```

### Security
- Only users with `role: "admin"` can modify registration settings
- Settings are checked server-side before page render
- Automatic redirect prevents access to registration when disabled

### Default Behavior
- Registration is enabled by default
- If database error occurs, defaults to enabled (fail-safe)
- Setting is auto-created on first access if missing