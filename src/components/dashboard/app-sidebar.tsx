"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  FlagIcon,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  User,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavAdmin } from "@/components/dashboard/nav-admin";
import { NavUser } from "@/components/dashboard/nav-user";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";
import { type User as UserAuth } from "better-auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: {
    navMain: {
      title: string;
      url: string;
      icon?: LucideIcon;
      isActive?: boolean;
      items?: {
        title: string;
        url: string;
      }[];
    }[];
    admin: {
      name: string;
      url: string;
      icon: LucideIcon;
    }[];
  };
  user?: UserAuth;
}

export function AppSidebar({ data, user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAdmin admin={data.admin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
