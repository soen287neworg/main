import { BitfieldSystemDefinitions } from "@/lib/types/roles";
import { checkAnyPermission } from "@/lib/utils/permissions";
import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const validateAdminAccess = createServerFn({ method: "GET" }).handler(
  async () => {
    return checkAnyPermission([
      BitfieldSystemDefinitions.MANAGE_ANALYTICS,
      BitfieldSystemDefinitions.MANAGE_RESOURCES,
      BitfieldSystemDefinitions.MANAGE_USERS,
      BitfieldSystemDefinitions.MANAGE_ROLES,
      BitfieldSystemDefinitions.MANAGE_ALERTS,
    ]);
  }
);

export const Route = createFileRoute("/dashboard/admin")({
  component: RouteComponent,
  async beforeLoad() {
    const { hasSession, allowed } = await validateAdminAccess();

    if (!hasSession) {
      throw redirect({ to: "/user/auth/login" });
    }

    if (!allowed) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
