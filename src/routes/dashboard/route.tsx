import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  Command,
  FlagIcon,
  PieChart,
  Settings2,
  User,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  navMain: [
    {
      title: "Resources",
      url: "/booking",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Book a room",
          url: "/booking/rooms",
        },
        {
          title: "My bookings",
          url: "/booking/me",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  admin: [
    {
      name: "Analytics",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: User,
    },
    {
      name: "Roles",
      url: "/admin/roles",
      icon: FlagIcon,
    },
    {
      name: "Resources",
      url: "#",
      icon: BookOpen,
    },
  ],
};

function RouteComponent() {
  const { data: sessionPayload } = authClient.useSession();
  const user = sessionPayload?.user;
  const navData = {
    navMain: data.navMain,
    admin: data.admin,
  };
  return (
    <SidebarProvider>
      <AppSidebar data={navData} user={user} />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
