import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
  BitfieldSystemDefinitions,
  hasSystemPermission,
} from "@/lib/types/roles";
import { getCurrentUserPermissionContext } from "@/lib/utils/permissions";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  BookOpen,
  FlagIcon,
  PieChart,
  Settings2,
  Tag,
  User,
} from "lucide-react";

const getDashboardPermissions = createServerFn({ method: "GET" }).handler(
  async () => {
    const permissionContext = await getCurrentUserPermissionContext();

    return {
      hasSession: Boolean(permissionContext),
      permissionMask: permissionContext?.permissionMask ?? 0,
    };
  }
);

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  async beforeLoad() {
    const { hasSession } = await getDashboardPermissions();

    if (!hasSession) {
      throw redirect({ to: "/user/auth/login" });
    }
  },
  loader: () => getDashboardPermissions(),
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
      requiredPermission: BitfieldSystemDefinitions.MANAGE_ANALYTICS,
    },
    {
      name: "Users",
      url: "/dashboard/admin/users",
      icon: User,
      requiredPermission: BitfieldSystemDefinitions.MANAGE_USERS,
    },
    {
      name: "Roles",
      url: "/dashboard/admin/roles",
      icon: FlagIcon,
      requiredPermission: BitfieldSystemDefinitions.MANAGE_ROLES,
    },
    {
      name: "Resources",
      url: "/dashboard/admin/resources",
      icon: BookOpen,
      requiredPermission: BitfieldSystemDefinitions.MANAGE_RESOURCES,
      items: [
        {
          title: "Room management",
          url: "/dashboard/admin/resources/rooms",
          requiredPermission: BitfieldSystemDefinitions.MANAGE_RESOURCES,
        },
        {
          title: "Review bookings",
          url: "/dashboard/admin/resources/review",
          requiredPermission: BitfieldSystemDefinitions.MANAGE_RESOURCES,
        },
        {
          title: "Schedules",
          url: "/dashboard/admin/resources/schedules",
          requiredPermission: BitfieldSystemDefinitions.MANAGE_RESOURCES,
        },
      ],
    },
    {
      name: "Categories",
      url: "/dashboard/admin/categories",
      icon: Tag,
      requiredPermission: BitfieldSystemDefinitions.MANAGE_RESOURCES,
    },
  ],
};

function RouteComponent() {
  const { data: sessionPayload } = authClient.useSession();
  const { permissionMask } = Route.useLoaderData();
  const user = sessionPayload?.user;
  const adminNav = data.admin
    .map((item) => {
      if (!item.items) {
        return item;
      }

      const filteredSubItems =
        item.items?.filter(
          (subItem) =>
            !subItem.requiredPermission ||
            hasSystemPermission(permissionMask, subItem.requiredPermission)
        ) ?? [];

      return {
        ...item,
        items: filteredSubItems,
      };
    })
    .filter((item) => {
      const allowedByItem =
        !item.requiredPermission ||
        hasSystemPermission(permissionMask, item.requiredPermission);

      if (item.items) {
        return allowedByItem && item.items.length > 0;
      }

      return allowedByItem;
    });
  const navData = {
    navMain: data.navMain,
    admin: adminNav,
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
