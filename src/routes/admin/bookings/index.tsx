import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/bookings/")({
  component: BookingsComponent,
});

function BookingsComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Bookings Management</h1>
      <p>View and manage all user bookings.</p>
    </div>
  );
}
