import { z } from "zod";

export const eventCategories = [
  "Robosprano",
  "Hackathon",
  "OtherEvent",
  "Civil",
  "Mechanical",
  "ComputerScience",
  "Electrical",
  "Gaming",
] as const;

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Event name must be at least 3 characters long" })
    .max(100, { message: "Event name must be at most 100 characters long" }),
  slugId: z
    .string()
    .min(3, { message: "Slug ID must be at least 3 characters long" })
    .max(100, { message: "Slug ID must be at most 100 characters long" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(10000, {
      message: "Description must be at most 10000 characters long",
    }),
  rules: z
    .string()
    .min(10, { message: "Rules must be at least 10 characters long" })
    .max(10000, {
      message: "Rules must be at most 10000 characters long",
    }),
  thumbnailKey: z.string().min(1, { message: "Thumbnail key is required" }),
  pdfKey: z.string().min(1, { message: "PDF key is required" }),
  imageKeys: z
    .array(z.string())
    .min(1, { message: "At least one image is required" })
    .max(10, { message: "Maximum 10 images allowed" }),
  priceType: z.enum(["free", "paid"], { message: "Price type is required" }),
  price: z.coerce
    .number()
    .min(0, { message: "Price must be a positive number or zero" }),
  venue: z
    .string()
    .min(3, { message: "Venue must be at least 3 characters long" })
    .max(200, { message: "Venue must be at most 200 characters long" }),
  date: z.coerce.date({ message: "Event date is required" }),
  category: z.enum(eventCategories, { message: "Category is required" }),
  teamSize: z.coerce
    .number()
    .min(1, { message: "Team size must be at least 1 member" })
    .max(20, { message: "Team size cannot exceed 20 members" })
    .optional()
    .default(4),
});

// Remove the separate eventUpdateSchema since z.coerce.date() handles string conversion

export const userSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  emailVerified: z.boolean().default(false),
  image: z.string().url({ message: "Invalid image URL" }).optional(),
  role: z.string().optional(),
  banned: z.boolean().default(false).optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
});

export const sessionSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  expiresAt: z.date({ message: "Expiration date is required" }),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string().min(1, { message: "User ID is required" }),
  impersonatedBy: z.string().optional(),
});

export const accountSchema = z.object({
  accountId: z.string().min(1, { message: "Account ID is required" }),
  providerId: z.string().min(1, { message: "Provider ID is required" }),
  userId: z.string().min(1, { message: "User ID is required" }),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
});

export const verificationSchema = z.object({
  identifier: z.string().min(1, { message: "Identifier is required" }),
  value: z.string().min(1, { message: "Value is required" }),
  expiresAt: z.date({ message: "Expiration date is required" }),
});

export const participationSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters long" })
    .max(100, { message: "Full name must be at most 100 characters long" }),
  email: z
    .string()
    .email({ message: "Invalid email address" }),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be 10 digits starting with 6-9" }),
  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Invalid WhatsApp number. Must be 10 digits starting with 6-9" })
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, { message: "Aadhaar number must be exactly 12 digits" }),
  state: z
    .string()
    .min(2, { message: "State must be at least 2 characters long" })
    .max(50, { message: "State must be at most 50 characters long" }),
  district: z
    .string()
    .min(2, { message: "District must be at least 2 characters long" })
    .max(50, { message: "District must be at most 50 characters long" }),
  collegeName: z
    .string()
    .min(3, { message: "College name must be at least 3 characters long" })
    .max(200, { message: "College name must be at most 200 characters long" }),
  collegeAddress: z
    .string()
    .min(10, { message: "College address must be at least 10 characters long" })
    .max(500, { message: "College address must be at most 500 characters long" }),
});

export const checkoutSchema = z.object({
  paymentScreenshotKey: z
    .string()
    .min(1, { message: "Payment screenshot is required" }),
  transactionId: z
    .string()
    .min(5, { message: "Transaction ID must be at least 5 characters long" })
    .max(50, { message: "Transaction ID must be at most 50 characters long" })
    .optional()
    .or(z.literal("")),
});

export type ParticipationSchemaType = z.infer<typeof participationSchema>;
export type CheckoutSchemaType = z.infer<typeof checkoutSchema>;
export type EventSchemaType = z.infer<typeof eventSchema>;

// Announcement constants and schemas
export const announcementCategories = [
  "EMERGENCY",
  "GENERAL", 
  "EVENT_UPDATE",
  "WORKSHOP",
  "LOGISTICS"
] as const;

export const announcementPriorities = [
  "NORMAL",
  "IMPORTANT", 
  "URGENT"
] as const;

export const announcementAudiences = [
  "PUBLIC",
  "PARTICIPANTS_ONLY",
  "VOLUNTEERS_ONLY", 
  "ORGANIZERS_ONLY"
] as const;

export const recurrenceTypes = [
  "NONE",
  "HOURLY",
  "DAILY",
  "WEEKLY"
] as const;

export const announcementSchema = z.object({
  // Auto-generated slugId (optional for form input)
  slugId: z.string().optional(),
  
  // Basic Information
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long" })
    .max(200, { message: "Title must be at most 200 characters long" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters long" })
    .max(10000, { message: "Description must be at most 10000 characters long" }),
  category: z.enum(announcementCategories, { message: "Please select a valid category" }),
  priority: z.enum(announcementPriorities, { message: "Please select a valid priority" }).default("NORMAL"),
  relatedEventId: z.string().optional().nullable(),

  // Media & Attachments  
  attachmentKeys: z
    .array(z.string())
    .default([])
    .refine(arr => arr.length <= 10, { message: "Maximum 10 attachments allowed" }),
  imageKeys: z
    .array(z.string()) 
    .default([])
    .refine(arr => arr.length <= 5, { message: "Maximum 5 images allowed" }),

  // Visibility & Control
  audience: z.enum(announcementAudiences, { message: "Please select a valid audience" }).default("PUBLIC"),
  sendNotifications: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  showInHomeBanner: z.boolean().default(false),

  // Scheduling
  publishDate: z.coerce.date({ message: "Publish date is required" }),
  expiryDate: z.coerce.date().optional().nullable(),

  // Recurring options
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(recurrenceTypes, { message: "Please select a valid recurrence type" }).default("NONE"),
  recurrenceInterval: z.coerce
    .number()
    .min(1, { message: "Interval must be at least 1" })
    .max(168, { message: "Interval cannot exceed 168 hours" })
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // If expiry date is provided, it should be after publish date
    if (data.expiryDate && data.publishDate) {
      return data.expiryDate > data.publishDate;
    }
    return true;
  },
  {
    message: "Expiry date must be after publish date",
    path: ["expiryDate"],
  }
).refine(
  (data) => {
    // If recurring is enabled, recurrence type should not be NONE
    if (data.isRecurring && data.recurrenceType === "NONE") {
      return false;
    }
    return true;
  },
  {
    message: "Recurrence type is required when recurring is enabled",
    path: ["recurrenceType"],
  }
).refine(
  (data) => {
    // If recurring is enabled with HOURLY type, interval is required
    if (data.isRecurring && data.recurrenceType === "HOURLY" && !data.recurrenceInterval) {
      return false;
    }
    return true;
  },
  {
    message: "Interval is required for hourly recurrence",
    path: ["recurrenceInterval"],
  }
);

export type AnnouncementSchemaType = z.infer<typeof announcementSchema>;
