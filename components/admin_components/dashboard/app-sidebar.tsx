"use client"

import * as React from "react"
import {
  IconCalendarStats,
  IconHome2,
  IconLayoutDashboardFilled,
  IconReport,
  IconSettings,
  IconSpeakerphone,
  IconTicket,
  IconTransactionRupee,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react"

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
      icon: IconLayoutDashboardFilled,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: IconCalendarStats,
    },
    {
      title: "Accommodations",
      url: "/admin/accommodations",
      icon: IconHome2,
    },
    {
      title: "Participants",
      url: "/admin/participants",
      icon: IconUser,
    },
    {
      title: "Teams",
      url: "/admin/team",
      icon: IconUsersGroup,
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: IconTransactionRupee,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
    {
      title: "Support Messages",
      url: "/admin/support-messages",
      icon: IconTicket,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Announcements",
      url: "/admin/announcement",
      icon: IconSpeakerphone,
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
