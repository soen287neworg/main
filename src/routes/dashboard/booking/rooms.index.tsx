import { Room } from "@/generated/prisma/client";
import { getPublicRooms } from "@/lib/services/RoomService";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const getRooms = createServerFn({ method: "GET" })
  .inputValidator((data: { categoryId?: string; search?: string }) => data)
  .handler(async ({ data }) => getPublicRooms(data.categoryId, data.search));

export const Route = createFileRoute("/dashboard/booking/rooms/")({
  component: RoomsList,
  validateSearch: z.object({
    categoryId: z.string().optional(),
    search: z.string().optional(),
  }),
  loaderDeps: ({ search: { categoryId, search } }) => ({ categoryId, search }),
  loader: async ({ deps: { categoryId, search } }) =>
    getRooms({ data: { categoryId, search } }),
});

export function RoomsList() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { categoryId, search } = Route.useSearch();
  const rooms: Room[] = Route.useLoaderData() || [];
  const [searchTerm, setSearchTerm] = useState(search || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    navigate({
      search: (prev) => ({
        ...prev,
        search: newSearchTerm || undefined,
      }),
      replace: true,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Rooms</h1>
      {categoryId && (
        <p className="text-gray-600 mb-4">
          Rooms filtered by Category ID:{" "}
          <span className="font-semibold">{categoryId}</span>
        </p>
      )}

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      {rooms.length === 0 ? (
        <p className="text-gray-500">No rooms available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/dashboard/booking/rooms/$roomId`}
              params={{ roomId: room.id }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={room.imageUrl}
                    alt={room.title}
                    className="w-full h-48 object-cover rounded-t-xl mb-4"
                  />
                  <CardTitle>{room.title}</CardTitle>
                  <CardDescription>{room.number}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{room.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Level: {room.level}
                  </p>
                  <p className="text-xs text-gray-500">
                    Capacity: {room.capacity}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {room.active ? "Active" : "Inactive"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
