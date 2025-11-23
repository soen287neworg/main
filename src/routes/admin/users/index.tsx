import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users/")({
  component: UsersComponent,
});

function UsersComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Users Management</h1>
      <p>Manage users and their roles.</p>
    </div>
  );
}
