import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getAllRooms,
  getRoomById,
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
import { useMemo, useState, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Room, RoomCategory, Booking } from "@/generated/prisma/client";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
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
import { RoomUpdateInput } from "@/generated/prisma/models";

type RoomWithDetails = Room & {
  category?: RoomCategory | null;
  bookings?: (Booking & { user: { name: string; email: string } })[];
  schedules?: any[];
};

export const getRooms = createServerFn({ method: "GET" }).handler(async () => {
  return await getAllRooms();
});

export const getRoomDetails = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roomId: string }) => data)
  .handler(async ({ data }) => {
    return await getRoomWithDetails(data.roomId);
  });

export const createRoomFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: RoomFormValues) => data)
  .handler(async ({ data }) => {
    const roomData = {
      number: data.number,
      title: data.title,
      description: data.description,
      note: data.note || null,
      level: data.level,
      capacity: data.capacity,
      categoryId: data.categoryId === "none" ? null : data.categoryId || null,
      active: data.active,
    };

    if (data.imageFile) {
      // TODO: Implement image upload logic
      roomData.imageUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    }

    return await createRoom(roomData);
  });

export const updateRoomFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roomId: string; roomData: RoomFormValues }) => data)
  .handler(async ({ data }) => {
    const roomData: any = {
      number: data.roomData.number,
      title: data.roomData.title,
      description: data.roomData.description,
      level: data.roomData.level,
      capacity: data.roomData.capacity,
      active: data.roomData.active,
    };

    // Only include optional fields if they have values
    if (data.roomData.note && data.roomData.note.trim()) {
      roomData.note = data.roomData.note;
    }

    if (data.roomData.categoryId && data.roomData.categoryId.trim()) {
      roomData.categoryId =
        data.roomData.categoryId === "none" ? null : data.roomData.categoryId;
    }

    // Handle image upload if provided
    if (data.roomData.imageFile) {
      // TODO: Implement image upload logic here
      // For now, we'll use a placeholder
      roomData.imageUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    }

    return await updateRoom(data.roomId, roomData);
  });

export const deleteRoomFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: { roomId: string }) => data)
  .handler(async ({ data }) => {
    return await deleteRoom(data.roomId);
  });

export const getCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    return await listCategoriesWithRooms();
  }
);

export const Route = createFileRoute("/dashboard/admin/resources/rooms")({
  component: RouteComponent,
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
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter(
      (room: RoomWithDetails) =>
        room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.level.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

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
    toast.promise(createRoomFn({ data: values }), {
      loading: "Loading...",
      success: "Room created successfully",
      error: "Failed to create room",
      finally() {
        router.invalidate();
      },
    });
  };

  const handleUpdateRoom = async (values: RoomFormValues) => {
    if (!selectedRoom) return;
    try {
      await updateRoomFn({
        data: { roomId: selectedRoom.id, roomData: values },
      });
      toast.success("Room updated successfully");
      router.invalidate();
    } catch (error) {
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
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => setIsCreateModalOpen(true)} className="ml-2">
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
