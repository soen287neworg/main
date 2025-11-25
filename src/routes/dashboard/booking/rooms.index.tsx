import { Room, RoomCategory } from "@/generated/prisma/client";
import { getPublicRooms } from "@/lib/services/RoomService";
import { listCategoriesWithRooms } from "@/lib/services/RoomCategoryService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";

export const getRooms = createServerFn({ method: "GET" })
  .inputValidator((data: { categoryId?: string; search?: string }) => data)
  .handler(async ({ data }) => {
    const normalizedCategory =
      data.categoryId === "uncategorized" ? null : data.categoryId;
    return getPublicRooms(normalizedCategory, data.search);
  });

export const getCategories = createServerFn({ method: "GET" }).handler(
  async () => listCategoriesWithRooms()
);

export const Route = createFileRoute("/dashboard/booking/rooms/")({
  component: RoomsList,
  validateSearch: z.object({
    categoryId: z.string().optional(),
    search: z.string().optional(),
  }),
  loaderDeps: ({ search: { categoryId, search } }) => ({ categoryId, search }),
  loader: async ({ deps: { categoryId, search } }) => {
    const [rooms, categories] = await Promise.all([
      getRooms({ data: { categoryId, search } }),
      getCategories(),
    ]);

    return { rooms, categories };
  },
});

export function RoomsList() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { categoryId, search } = Route.useSearch();
  const { rooms = [], categories = [] } = Route.useLoaderData() as {
    rooms: Room[];
    categories: RoomCategory[];
  };
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryId || "all"
  );

  const sortedCategories = useMemo(
    () => [...(categories || [])].sort((a, b) => a.label.localeCompare(b.label)),
    [categories]
  );

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

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            navigate({
              search: (prev) => ({
                ...prev,
                categoryId: value === "all" ? undefined : value,
              }),
              replace: true,
            });
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {sortedCategories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
