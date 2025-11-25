import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomWithDetails,
} from "@/lib/services/RoomService";
import { listCategoriesWithRooms } from "@/lib/services/RoomCategoryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Room, RoomCategory, Booking } from "@/generated/prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BitfieldSystemDefinitions } from "@/lib/types/roles";
import { assertPermission, checkPermission } from "@/lib/utils/permissions";
import {
  CreateRoomModal,
  EditRoomModal,
  DeleteRoomModal,
} from "@/components/dashboard/room-management-modals";
import { RoomFormValues } from "@/components/dashboard/room-management-modals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

type RoomWithDetails = Room & {
  category?: RoomCategory | null;
  bookings?: (Booking & { user: { name: string; email: string } })[];
  schedules?: any[];
};

type CreateRoomData = {
  number: string;
  title: string;
  description: string;
  note?: string;
  level: string;
  capacity: number;
  categoryId?: string;
  active: boolean;
  imageUrl?: string;
};

const verifyResourceManagementAccess = createServerFn({ method: "GET" }).handler(
  async () => checkPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES)
);

export const getRooms = createServerFn({ method: "GET" }).handler(async () => {
  await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
  return await getAllRooms();
});

export const getRoomDetails = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roomId: string }) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    return await getRoomWithDetails(data.roomId);
  });

export const createRoomFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateRoomData) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    return await createRoom(data);
  });

export const updateRoomFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roomId: string; roomData: CreateRoomData }) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    const roomData = {
      number: data.roomData.number,
      title: data.roomData.title,
      description: data.roomData.description,
      level: data.roomData.level,
      capacity: data.roomData.capacity,
      active: data.roomData.active,
    } as any;

    // Only include optional fields if they have values
    if (data.roomData.note && data.roomData.note.trim()) {
      roomData.note = data.roomData.note;
    }

    if (data.roomData.categoryId && data.roomData.categoryId.trim()) {
      roomData.categoryId =
        data.roomData.categoryId === "none" ? null : data.roomData.categoryId;
    }

    // Handle image upload if provided
    if (data.roomData.imageUrl) {
      roomData.imageUrl = data.roomData.imageUrl;
    }

    return await updateRoom(data.roomId, roomData);
  });

export const deleteRoomFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roomId: string }) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    return await deleteRoom(data.roomId);
  });

export const getCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    return await listCategoriesWithRooms();
  }
);

export const Route = createFileRoute("/dashboard/admin/resources/rooms")({
  component: RouteComponent,
  async beforeLoad() {
    const { hasSession, allowed } = await verifyResourceManagementAccess();

    if (!hasSession) {
      throw redirect({ to: "/user/auth/login" });
    }

    if (!allowed) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    const rooms = await getRooms();
    const categories = await getCategories();
    return { rooms, categories };
  },
});

function RoomListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomDetailsSkeleton() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <Suspense
      fallback={
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <RoomListSkeleton />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <RoomDetailsSkeleton />
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    >
      <RoomsPage />
    </Suspense>
  );
}

function RoomsPage() {
  const { rooms, categories } = Route.useLoaderData();
  const [selectedRoom, setSelectedRoom] = useState<RoomWithDetails | null>(
    rooms?.[0] ?? null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    const query = searchTerm.toLowerCase();

    return rooms.filter((room: RoomWithDetails) => {
      const roomCategoryId = room.categoryId ?? room.category?.id ?? null;
      const matchesSearch =
        room.title.toLowerCase().includes(query) ||
        room.number.toLowerCase().includes(query) ||
        room.level.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all"
          ? true
          : categoryFilter === "uncategorized"
            ? !roomCategoryId
            : roomCategoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [rooms, searchTerm, categoryFilter]);

  useEffect(() => {
    if (selectedRoom) {
      const updatedRoom = rooms.find(
        (r: RoomWithDetails) => r.id === selectedRoom.id
      );
      if (updatedRoom) {
        setSelectedRoom(updatedRoom);
      }
    }
  }, [rooms, selectedRoom]);

  const loadRoomDetails = async (room: RoomWithDetails) => {
    try {
      const roomDetails = await getRoomDetails({ data: { roomId: room.id } });
      setSelectedRoom(roomDetails);
    } catch (error) {
      console.error("Failed to load room details:", error);
    }
  };

  const handleCreateRoom = async (values: RoomFormValues) => {
    try {
      // Handle image upload first if there's a file
      let imageUrl: string | undefined = undefined;

      if (values.imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", values.imageFile);

          const response = await fetch("/api/rooms/upload-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const result = await response.json();
          imageUrl = result.imageUrl;
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast.error("Failed to upload image");
          return;
        }
      }

      const roomData: CreateRoomData = {
        number: values.number,
        title: values.title,
        description: values.description,
        note: values.note || undefined,
        level: values.level,
        capacity: values.capacity,
        categoryId:
          values.categoryId === "none" ? undefined : values.categoryId,
        active: values.active,
        imageUrl: imageUrl,
      };

      await createRoomFn({ data: roomData });
      toast.success("Room created successfully");
      router.invalidate();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
    }
  };

  const handleUpdateRoom = async (values: RoomFormValues) => {
    if (!selectedRoom) return;

    try {
      // Handle image upload if there's a new file
      let imageUrl: string | undefined = selectedRoom.imageUrl;

      if (values.imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", values.imageFile);

          const response = await fetch("/api/rooms/upload-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const result = await response.json();
          imageUrl = result.imageUrl;
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast.error("Failed to upload image");
          return;
        }
      }

      const roomData: CreateRoomData = {
        number: values.number,
        title: values.title,
        description: values.description,
        note: values.note || undefined,
        level: values.level,
        capacity: values.capacity,
        categoryId:
          values.categoryId === "none" ? undefined : values.categoryId,
        active: values.active,
        imageUrl: imageUrl,
      };

      await updateRoomFn({
        data: { roomId: selectedRoom.id, roomData },
      });
      toast.success("Room updated successfully");
      router.invalidate();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update room:", error);
      toast.error("Failed to update room");
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoomFn({ data: { roomId: selectedRoom.id } });
      toast.success("Room deleted successfully");
      setSelectedRoom(null);
      router.invalidate();
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={30}>
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
              <Input
                className="sm:max-w-xs"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories?.map((category: RoomCategory) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="sm:ml-2">
              Create Room
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          {filteredRooms.map((room: RoomWithDetails) => (
            <Card
              key={room.id}
              className={`cursor-pointer ${
                selectedRoom?.id === room.id ? "bg-muted" : ""
              }`}
              onClick={() => loadRoomDetails(room)}
            >
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Room {room.number}</CardTitle>
                  <Badge variant={room.active ? "default" : "secondary"}>
                    {room.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="font-medium">{room.title}</p>
                <p className="text-sm text-muted-foreground">{room.level}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{room.capacity} people</span>
                  {room.category && (
                    <>
                      <span>•</span>
                      <span>{room.category.label}</span>
                    </>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        {selectedRoom ? (
          <div className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    Room {selectedRoom.number}: {selectedRoom.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge
                      variant={selectedRoom.active ? "default" : "secondary"}
                    >
                      {selectedRoom.active ? "Active" : "Inactive"}
                    </Badge>
                    {selectedRoom.category && (
                      <Badge variant="outline">
                        {selectedRoom.category.label}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RoomDetails room={selectedRoom} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p>Select a room to see details</p>
          </div>
        )}
      </ResizablePanel>

      <CreateRoomModal
        categories={categories}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      {selectedRoom && (
        <>
          <EditRoomModal
            room={selectedRoom}
            categories={categories}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdateRoom}
          />
          <DeleteRoomModal
            room={selectedRoom}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDeleteRoom}
          />
        </>
      )}
    </ResizablePanelGroup>
  );
}

function RoomDetails({ room }: { room: RoomWithDetails }) {
  return (
    <div className="space-y-6">
      {/* Room Image */}
      {room.imageUrl && (
        <div>
          <h3 className="font-semibold mb-2">Room Image</h3>
          <img
            src={room.imageUrl}
            alt={room.title}
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">Level</p>
            <p className="text-sm text-muted-foreground">{room.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">Capacity</p>
            <p className="text-sm text-muted-foreground">
              {room.capacity} people
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">Status</p>
            <p className="text-sm text-muted-foreground">
              {room.active ? "Available" : "Unavailable"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-sm text-muted-foreground">{room.description}</p>
      </div>

      {room.note && (
        <div>
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{room.note}</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Recent Bookings</h3>
        {room.bookings && room.bookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {room.bookings.slice(0, 5).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>
                    {new Date(booking.startTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                    {new Date(booking.endTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "CONFIRMED"
                          ? "default"
                          : booking.status === "PENDING"
                            ? "secondary"
                            : booking.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No bookings found</p>
        )}
      </div>

      {/* Calendar View Placeholder */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Booking Calendar
        </h3>
        <div className="border rounded-lg p-4 h-64 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Calendar view coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
