import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/rooms/")({
  component: RoomsComponent,
});

function RoomsComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Rooms Management</h1>
      <p>View, add, and remove rooms.</p>
    </div>
  );
}
