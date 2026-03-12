# 🎓 INSPRANO 2025 — Registration & Admin Dashboard

The official registration portal and admin dashboard for **INSPRANO 2025**, the annual technical fest of **Government College of Engineering, Kalahandi**. Built with modern web technologies, the platform handles event registration, participant management, payment verification, accommodation booking, and more.

## ✨ Features

### 🎫 Public Portal
- **Event Browsing** — View all events across categories (Robosprano, Hackathon, Gaming, Civil, Mechanical, Computer Science, Electrical, and more)
- **Online Registration** — Seamless event registration with form validation (Zod)
- **Payment Upload** — Upload payment screenshots for paid events
- **Announcements** — Stay updated with the latest fest announcements
- **QR Code Generation** — Auto-generated QR codes for participants
- **Responsive Design** — Mobile-first UI with dark theme

### 🛡️ Admin Dashboard
- **Dashboard Overview** — Real-time stats and analytics with charts (Recharts)
- **Event Management** — Create, edit, and manage events with rich text descriptions (Tiptap editor)
- **Participant Management** — View, search, and manage all registrations
- **Payment Verification** — Approve or reject payment proofs
- **Accommodation Management** — Handle accommodation bookings for outstation participants
- **Announcement System** — Publish announcements with file attachments
- **Team Management** — Manage organizing team members
- **Reports & Exports** — Export participant data to Excel (XLSX) and generate PDF invoices
- **Support Tickets** — In-app support messaging system
- **System Settings** — Toggle registration open/close, and other site-wide settings

### 🔐 Authentication & Security
- **Better Auth** — Session-based authentication with role-based access control
- **Admin Protection** — Server-side admin route protection with middleware
- **Arcjet Integration** — Rate limiting and bot protection
- **Registration Toggle** — Dynamically enable/disable registrations site-wide

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, React Server Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui (New York style) |
| **Database** | PostgreSQL with [Prisma ORM](https://www.prisma.io) |
| **Authentication** | [Better Auth](https://www.better-auth.com) |
| **File Storage** | AWS S3 (via `@aws-sdk/client-s3`) |
| **Rich Text Editor** | [Tiptap](https://tiptap.dev) |
| **Charts** | [Recharts](https://recharts.org) |
| **Forms** | React Hook Form + Zod validation |
| **Animations** | Framer Motion |
| **Drag & Drop** | dnd-kit |
| **Email** | Nodemailer |
| **PDF Generation** | jsPDF + pdf-lib |
| **Data Export** | XLSX |
| **QR Codes** | qrcode |
| **Security** | [Arcjet](https://arcjet.com) (rate limiting & bot protection) |
| **Deployment** | [Vercel](https://vercel.com) |

## 📂 Project Structure

```
insprano-dashboard/
├── app/
│   ├── (auth)/              # Authentication pages (login, register)
│   ├── (public)/            # Public-facing pages
│   ├── admin/               # Admin dashboard
│   │   ├── accommodations/  # Accommodation management
│   │   ├── announcement/    # Announcement management
│   │   ├── events/          # Event CRUD
│   │   ├── participants/    # Participant management
│   │   ├── payments/        # Payment verification
│   │   ├── reports/         # Reports & exports
│   │   ├── settings/        # System settings
│   │   ├── support-messages/# Support ticket management
│   │   └── team/            # Team management
│   ├── api/                 # API routes
│   ├── attachment-list/     # Attachment viewer
│   ├── auth/                # Auth API handlers
│   ├── data/                # Static/seed data
│   ├── file-viewer/         # File preview
│   └── thank-you/           # Post-registration thank you page
├── components/
│   ├── admin_components/    # Admin-specific components
│   ├── file-uploader/       # File upload components
│   ├── public_components/   # Public-facing components
│   └── ui/                  # shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
│   ├── auth.ts              # Auth configuration
│   ├── db.ts                # Prisma client
│   ├── mailer.ts            # Email templates & sending
│   ├── invoice-generator.ts # PDF invoice generation
│   ├── s3Client.ts          # S3 file storage client
│   ├── zodSchema.ts         # Zod validation schemas
│   └── ...
├── prisma/
│   └── schema.prisma        # Database schema
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database
- **AWS S3** bucket (or S3-compatible storage)
- **SMTP** credentials for email

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gyanranjan-Priyam/insprano-dashboard.git
   cd insprano-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/insprano"

   # Authentication (Better Auth)
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   # AWS S3
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_REGION="your-region"
   NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES="your-bucket-name"

   # Email (SMTP)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT=587
   SMTP_USER="your-email@example.com"
   SMTP_PASS="your-email-password"

   # Arcjet
   ARCJET_KEY="your-arcjet-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🗃️ Database Models

The Prisma schema includes the following core models:

| Model | Description |
|---|---|
| `User` | Registered users with profile details (college, state, contact info) |
| `Session` | User session management |
| `Account` | OAuth/credential accounts |
| `Verification` | Email verification tokens |
| `Event` | Events with categories, pricing, venue, and media |
| `Participation` | Event registrations linking users to events |
| `AccommodationBooking` | Accommodation bookings for participants |
| `SupportTicket` | Support tickets raised by users |
| `SupportResponse` | Admin responses to support tickets |

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client & build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🌐 Deployment

The project is configured for **Vercel** deployment with:
- Prisma client generation during build (`prisma generate && next build`)
- API routes with 30-second max duration
- Optimized image caching via middleware

## 📄 License

This project is proprietary software developed for INSPRANO 2025, Government College of Engineering, Kalahandi.

---

**Built with ❤️ for INSPRANO 2025**