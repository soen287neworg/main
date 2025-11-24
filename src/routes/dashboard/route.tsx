import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { getSessionFn } from "@/lib/controllers/AuthController";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  BookOpen,
  FlagIcon,
  PieChart,
  Settings2,
  Tag,
  User,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  async beforeLoad(ctx) {
    const sess = await getSessionFn();

    if (!sess?.user) {
      throw redirect({ to: "/user/auth/login" });
    }
  },
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
          url: "/dashboard/booking/rooms",
        },
        {
          title: "My bookings",
          url: "/dashboard/booking/me",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile settings",
          url: "/dashboard/profile/settings",
        },
      ],
    },
  ],
  admin: [
    {
      name: "Analytics",
      url: "/dashboard/admin/analytics",
      icon: PieChart,
    },
    {
      name: "Users",
      url: "/dashboard/admin/users",
      icon: User,
    },
    {
      name: "Roles",
      url: "/dashboard/admin/roles",
      icon: FlagIcon,
    },
    {
      name: "Resources",
      url: "/dashboard/admin/resources",
      icon: BookOpen,
    },
    {
      name: "Categories",
      url: "/dashboard/admin/categories",
      icon: Tag,
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
