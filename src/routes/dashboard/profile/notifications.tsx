import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/profile/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/profile/notifications"!</div>;
}
