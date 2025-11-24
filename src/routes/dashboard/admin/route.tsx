import { createFileRoute, Outlet } from "@tanstack/react-router";

// This function verifies whether a user has the system roles to access this setting

export const Route = createFileRoute("/dashboard/admin")({
  component: RouteComponent,
  async beforeLoad(ctx) {},
});

function RouteComponent() {
  return <Outlet />;
}
