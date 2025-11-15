"use client"

import * as React from "react"
import {
  Calendar,
  Home,
  LayoutDashboard,
  FileText,
  Settings,
  Megaphone,
  Ticket,
  DollarSign,
  User,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/admin_components/dashboard/nav-main"
import { NavSecondary } from "@/components/admin_components/dashboard/nav-secondary"
import { NavUser } from "@/components/admin_components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: Calendar,
    },
    {
      title: "Accommodations",
      url: "/admin/accommodations",
      icon: Home,
    },
    {
      title: "Participants",
      url: "/admin/participants",
      icon: User,
    },
    {
      title: "Teams",
      url: "/admin/team",
      icon: Users,
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: DollarSign,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Support Messages",
      url: "/admin/support-messages",
      icon: Ticket,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Announcements",
      url: "/admin/announcement",
      icon: Megaphone,
    },
  ],
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Create user data with proper formatting
  const userData = user ? {
    name: user.name || "User",
    email: user.email,
    avatar: user.image || "/default-avatar.png",
  } : {
    name: "Admin User",
    email: "admin@example.com", 
    avatar: "/default-avatar.png",
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <div className="flex items-center">
                  <span className="text-xl font-bold inline-flex items-center hover:text-amber-400">
                    <Image
                    src="/assets/logo.png"
                    alt="Insprano Logo"
                    width={40}
                    height={40}
                    className="inline-block mr-2 mb-1"
                    priority
                  />
                    INSPRANO | GCEK
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
