import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/profile/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/profile/settings"!</div>;
}
