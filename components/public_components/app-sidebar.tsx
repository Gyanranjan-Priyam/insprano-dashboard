"use client"

import * as React from "react"
import {
  Calendar,
  BarChart,
  LayoutDashboard,
  Folder,
  HelpCircle,
  Home,
  Settings,
  Users,
  Plus,
  List,
} from "lucide-react"

import { NavMain } from "@/components/public_components/nav-main"
import { NavSecondary } from "@/components/public_components/nav-secondary"
import { NavUser } from "@/components/public_components/nav-user"
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
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Events",
      url: "/dashboard/events",
      icon: Calendar,
    },
    {
      title: "Accommodations",
      url: "/dashboard/accommodations",
      icon: Home,
    },
    {
      title: "Participate",
      url: "/dashboard/participate",
      icon: Plus,
    },
    {
      title: "Teams",
      url: "/dashboard/teams",
      icon: Users,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Contact Support",
      url: "/dashboard/contact-support",
      icon: HelpCircle,
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
    name: "User",
    email: "user@example.com", 
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
              <Link href="/dashboard">
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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
