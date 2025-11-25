import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Plus,
  CalendarClock,
  Clock3,
  Power,
  ShieldX,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Room } from "@/generated/prisma/client";
import {
  ScheduleWithDetails,
  addBlackoutToSchedule,
  createScheduleForRoom,
  updateScheduleForRoom,
  updateBlackout,
  deleteBlackout,
} from "@/lib/services/ScheduleService";
import { getRoomsWithSchedules as fetchRoomsWithSchedules } from "@/lib/services/RoomService";
import { BitfieldSystemDefinitions } from "@/lib/types/roles";
import { assertPermission, checkPermission } from "@/lib/utils/permissions";

type OperatingHoursFormInput = {
  dayOfWeek: number;
  openingTime: string;
  closingTime: string;
  slotDuration: number;
};

type ScheduleFormPayload = {
  id?: string;
  roomId: string;
  name: string;
  priority: number;
  activeFrom: string;
  expiresAt?: string | null;
  isActive: boolean;
  operatingHours: OperatingHoursFormInput[];
};

type BlackoutPayload = {
  blackoutId?: string;
  scheduleId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
};

type RoomWithSchedules = Room & { schedules: ScheduleWithDetails[] };
type BlackoutItem = ScheduleWithDetails["blackouts"][number];

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const defaultOperatingHours: OperatingHoursFormInput[] = [
  { dayOfWeek: 1, openingTime: "09:00", closingTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 2, openingTime: "09:00", closingTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 3, openingTime: "09:00", closingTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 4, openingTime: "09:00", closingTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 5, openingTime: "09:00", closingTime: "17:00", slotDuration: 60 },
];

const toInputDateTime = (value?: string | Date | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "No end date";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sortSchedules = (list: ScheduleWithDetails[]) =>
  [...list].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.activeFrom).getTime() - new Date(a.activeFrom).getTime();
  });

const verifySchedulesAccess = createServerFn({ method: "GET" }).handler(
  async () => checkPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES)
);

export const getRoomsFn = createServerFn({ method: "GET" }).handler(async () => {
  await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
  return (await fetchRoomsWithSchedules()) as RoomWithSchedules[];
});

export const saveScheduleFn = createServerFn({ method: "POST" })
  .inputValidator((data: ScheduleFormPayload) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    const activeFrom = new Date(data.activeFrom);
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    if (Number.isNaN(activeFrom.getTime())) {
      throw new Error("Please select when this schedule becomes active.");
    }

    if (!data.name?.trim()) {
      throw new Error("Schedule name is required.");
    }

    const operatingHours =
      data.operatingHours?.map((oh) => ({
        dayOfWeek: Number(oh.dayOfWeek),
        openingTime: oh.openingTime,
        closingTime: oh.closingTime,
        slotDuration: Number(oh.slotDuration),
      })) ?? [];

    if (operatingHours.length === 0) {
      throw new Error("Add at least one operating hours entry.");
    }

    const payload = {
      name: data.name.trim(),
      priority: Number.isFinite(Number(data.priority))
        ? Number(data.priority)
        : 0,
      activeFrom,
      expiresAt,
      isActive: Boolean(data.isActive),
      operatingHours,
    };

    return data.id
      ? updateScheduleForRoom(data.id, data.roomId, payload)
      : createScheduleForRoom(data.roomId, payload);
  });

export const createBlackoutFn = createServerFn({ method: "POST" })
  .inputValidator((data: BlackoutPayload) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new Error("Please provide both start and end times.");
    }

    if (endTime <= startTime) {
      throw new Error("End time must be after start time.");
    }

    const blackout = await addBlackoutToSchedule(data.scheduleId, {
      startTime,
      endTime,
      reason: data.reason,
    });

    return { blackout, scheduleId: data.scheduleId };
  });

export const updateBlackoutFn = createServerFn({ method: "POST" })
  .inputValidator((data: BlackoutPayload) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    if (!data.blackoutId) {
      throw new Error("Blackout id is required.");
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new Error("Please provide both start and end times.");
    }

    if (endTime <= startTime) {
      throw new Error("End time must be after start time.");
    }

    const blackout = await updateBlackout(data.blackoutId, {
      startTime,
      endTime,
      reason: data.reason,
    });

    return { blackout, scheduleId: data.scheduleId };
  });

export const deleteBlackoutFn = createServerFn({ method: "POST" })
  .inputValidator((data: { blackoutId: string }) => data)
  .handler(async ({ data }) => {
    await assertPermission(BitfieldSystemDefinitions.MANAGE_RESOURCES);
    if (!data.blackoutId) {
      throw new Error("Blackout id is required.");
    }
    await deleteBlackout(data.blackoutId);
    return { blackoutId: data.blackoutId };
  });

export const Route = createFileRoute("/dashboard/admin/resources/schedules")({
  component: RouteComponent,
  async beforeLoad() {
    const { hasSession, allowed } = await verifySchedulesAccess();

    if (!hasSession) {
      throw redirect({ to: "/user/auth/login" });
    }

    if (!allowed) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    const rooms = await getRoomsFn();
    return { rooms };
  },
});

function RouteComponent() {
  return (
    <Suspense fallback={<SchedulesSkeleton />}>
      <SchedulesPage />
    </Suspense>
  );
}

function SchedulesSkeleton() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full min-h-[520px]">
      <ResizablePanel defaultSize={32}>
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={68}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function SchedulesPage() {
  const { rooms: loadedRooms } = Route.useLoaderData();
  const [rooms, setRooms] = useState<RoomWithSchedules[]>(loadedRooms ?? []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    loadedRooms?.[0]?.id ?? null
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBlackoutModalOpen, setIsBlackoutModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithDetails | null>(null);
  const [targetSchedule, setTargetSchedule] = useState<ScheduleWithDetails | null>(null);
  const [editingBlackout, setEditingBlackout] = useState<{
    schedule: ScheduleWithDetails;
    blackout: BlackoutItem;
  } | null>(null);
  const [deleteBlackoutTarget, setDeleteBlackoutTarget] = useState<{
    roomId: string;
    scheduleId: string;
    blackout: BlackoutItem;
  } | null>(null);

  useEffect(() => {
    setRooms(loadedRooms ?? []);
  }, [loadedRooms]);

  useEffect(() => {
    if (selectedRoomId) {
      const existing = rooms.find((room) => room.id === selectedRoomId);
      if (!existing && rooms[0]) {
        setSelectedRoomId(rooms[0].id);
      }
    } else if (rooms[0]) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const filteredRooms = useMemo(() => {
    if (!rooms?.length) return [];
    return rooms.filter((room) => {
      const query = searchTerm.toLowerCase();
      return (
        room.title.toLowerCase().includes(query) ||
        room.number.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query)
      );
    });
  }, [rooms, searchTerm]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const upsertScheduleForRoom = (roomId: string, schedule: ScheduleWithDetails) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, schedules: sortSchedules(upsertScheduleList(room.schedules, schedule)) }
          : room
      )
    );
  };

  const upsertScheduleList = (
    list: ScheduleWithDetails[],
    schedule: ScheduleWithDetails
  ) => {
    const exists = list.some((s) => s.id === schedule.id);
    return exists
      ? list.map((s) => (s.id === schedule.id ? schedule : s))
      : [...list, schedule];
  };

  const handleSaveSchedule = async (payload: ScheduleFormPayload) => {
    try {
      const saved = (await saveScheduleFn({ data: payload })) as ScheduleWithDetails;
      upsertScheduleForRoom(payload.roomId, saved);
      toast.success(payload.id ? "Schedule updated." : "Schedule created.");
      setIsScheduleModalOpen(false);
      setEditingSchedule(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save schedule."
      );
    }
  };

  const handleSaveBlackout = async (payload: BlackoutPayload) => {
    try {
      const result = payload.blackoutId
        ? await updateBlackoutFn({ data: payload })
        : await createBlackoutFn({ data: payload });

      setRooms((prev) =>
        prev.map((room) =>
          room.id !== payload.roomId
            ? room
            : {
                ...room,
                schedules: room.schedules.map((schedule) => {
                  if (schedule.id !== payload.scheduleId) return schedule;
                  const updatedList = payload.blackoutId
                    ? schedule.blackouts.map((b) =>
                        b.id === payload.blackoutId ? result.blackout : b
                      )
                    : [result.blackout, ...schedule.blackouts];
                  return {
                    ...schedule,
                    blackouts: updatedList,
                  };
                }),
              }
        )
      );

      toast.success(payload.blackoutId ? "Blackout updated." : "Blackout added.");
      setIsBlackoutModalOpen(false);
      setTargetSchedule(null);
      setEditingBlackout(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save blackout."
      );
    }
  };

  const handleDeleteBlackout = async ({
    blackoutId,
    scheduleId,
    roomId,
  }: {
    blackoutId: string;
    scheduleId: string;
    roomId: string;
  }) => {
    try {
      await deleteBlackoutFn({ data: { blackoutId } });
      setRooms((prev) =>
        prev.map((room) =>
          room.id !== roomId
            ? room
            : {
                ...room,
                schedules: room.schedules.map((schedule) =>
                  schedule.id !== scheduleId
                    ? schedule
                    : {
                        ...schedule,
                        blackouts: schedule.blackouts.filter((b) => b.id !== blackoutId),
                      }
                ),
              }
        )
      );
      toast.success("Blackout removed.");
      setDeleteBlackoutTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove blackout."
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Room schedules</h1>
        <p className="text-muted-foreground">
          Manage schedule priority, operating hours, and blackout windows for every room.
        </p>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-full min-h-[520px]">
        <ResizablePanel defaultSize={32} minSize={25}>
          <div className="p-4 space-y-3">
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              {filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className={cn(
                    "cursor-pointer transition hover:border-primary",
                    selectedRoomId === room.id ? "border-primary shadow-sm" : ""
                  )}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">{room.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Room #{room.number} - Level {room.level} - {room.schedules.length} schedule
                      {room.schedules.length === 1 ? "" : "s"}
                    </p>
                  </CardHeader>
                </Card>
              ))}
              {filteredRooms.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No rooms match your search.
                </p>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={68} minSize={40}>
          {selectedRoom ? (
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{selectedRoom.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Room #{selectedRoom.number} - Level {selectedRoom.level} - Capacity {selectedRoom.capacity}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingSchedule(null);
                    setIsScheduleModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New schedule
                </Button>
              </div>

              <div className="space-y-3">
                {selectedRoom.schedules.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                      No schedules yet. Create one to set availability for this room.
                    </CardContent>
                  </Card>
                ) : (
                  selectedRoom.schedules.map((schedule) => (
                    <Card key={schedule.id} className="border">
                      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{schedule.name}</CardTitle>
                            <Badge variant={schedule.isActive ? "secondary" : "outline"}>
                              <span className="flex items-center gap-1">
                                <Power className="h-3.5 w-3.5" />
                                {schedule.isActive ? "Active" : "Paused"}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Priority {schedule.priority} - Starts {formatDateTime(schedule.activeFrom)}{" "}
                            - {schedule.expiresAt ? `Ends ${formatDateTime(schedule.expiresAt)}` : `No expiration`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSchedule(schedule);
                              setIsScheduleModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setTargetSchedule(schedule);
                              setEditingBlackout(null);
                              setIsBlackoutModalOpen(true);
                            }}
                          >
                            + Blackout
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoRow
                            icon={<CalendarClock className="h-4 w-4" />}
                            label="Active window"
                            value={`${formatDateTime(schedule.activeFrom)} to ${
                              schedule.expiresAt ? formatDateTime(schedule.expiresAt) : "no end"
                            }`}
                          />
                          <InfoRow
                            icon={<Clock3 className="h-4 w-4" />}
                            label="Priority"
                            value={`Priority ${schedule.priority}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">Operating hours</h4>
                            <Badge variant="outline">{schedule.operatingHours.length}</Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            {schedule.operatingHours.map((oh) => (
                              <div
                                key={`${schedule.id}-${oh.dayOfWeek}-${oh.openingTime}-${oh.closingTime}`}
                                className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{dayNames[oh.dayOfWeek]}</span>
                                  <Badge variant="secondary">{oh.slotDuration} min slots</Badge>
                                </div>
                                <p className="text-muted-foreground">
                                  {oh.openingTime} - {oh.closingTime}
                                </p>
                              </div>
                            ))}
                            {schedule.operatingHours.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No hours defined for this schedule.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">Blackouts</h4>
                            <Badge variant="outline">{schedule.blackouts.length}</Badge>
                          </div>
                          {schedule.blackouts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No blackout windows for this schedule.
                            </p>
                          ) : (
                            <div className="grid gap-2 md:grid-cols-2">
                              {schedule.blackouts.map((blackout) => (
                                <div
                                  key={blackout.id}
                                  className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 font-medium text-destructive">
                                      <ShieldX className="h-4 w-4" />
                                      Maintenance window
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                          setTargetSchedule(schedule);
                                          setEditingBlackout({ schedule, blackout });
                                          setIsBlackoutModalOpen(true);
                                        }}
                                        aria-label="Edit blackout"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                          setDeleteBlackoutTarget({
                                            blackout,
                                            scheduleId: schedule.id,
                                            roomId: selectedRoom.id,
                                          })
                                        }
                                        aria-label="Delete blackout"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground">
                                    {formatDateTime(blackout.startTime)} to {formatDateTime(blackout.endTime)}
                                  </p>
                                  {blackout.reason && (
                                    <p className="text-muted-foreground">Reason: {blackout.reason}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a room to view its schedules.
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <ScheduleModal
        room={selectedRoom}
        schedule={editingSchedule}
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setEditingSchedule(null);
          setIsScheduleModalOpen(false);
        }}
        onSave={handleSaveSchedule}
      />

      <BlackoutModal
        room={selectedRoom}
        schedule={targetSchedule}
        blackout={editingBlackout?.blackout ?? null}
        isOpen={isBlackoutModalOpen}
        onClose={() => {
          setTargetSchedule(null);
          setEditingBlackout(null);
          setIsBlackoutModalOpen(false);
        }}
        onSave={handleSaveBlackout}
      />

      <Dialog
        open={!!deleteBlackoutTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteBlackoutTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove blackout window?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will reopen the schedule for bookings during this time window.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteBlackoutTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!deleteBlackoutTarget) return;
                handleDeleteBlackout({
                  blackoutId: deleteBlackoutTarget.blackout.id,
                  scheduleId: deleteBlackoutTarget.scheduleId,
                  roomId: deleteBlackoutTarget.roomId,
                });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border bg-muted/30 px-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

const scheduleFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  priority: z.coerce.number().min(0, "Priority cannot be negative"),
  activeFrom: z.string().min(1, "Start date is required"),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

function ScheduleModal({
  room,
  schedule,
  isOpen,
  onClose,
  onSave,
}: {
  room: RoomWithSchedules | null;
  schedule: ScheduleWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ScheduleFormPayload) => void;
}) {
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: schedule?.name ?? "",
      priority: schedule?.priority ?? 0,
      activeFrom: schedule?.activeFrom
        ? toInputDateTime(schedule.activeFrom)
        : toInputDateTime(new Date()),
      expiresAt: schedule?.expiresAt ? toInputDateTime(schedule.expiresAt) : "",
      isActive: schedule?.isActive ?? true,
    },
  });

  const [operatingHours, setOperatingHours] = useState<OperatingHoursFormInput[]>(
    schedule?.operatingHours ?? defaultOperatingHours
  );

  useEffect(() => {
    form.reset({
      name: schedule?.name ?? "",
      priority: schedule?.priority ?? 0,
      activeFrom: schedule?.activeFrom
        ? toInputDateTime(schedule.activeFrom)
        : toInputDateTime(new Date()),
      expiresAt: schedule?.expiresAt ? toInputDateTime(schedule.expiresAt) : "",
      isActive: schedule?.isActive ?? true,
    });
    setOperatingHours(schedule?.operatingHours ?? defaultOperatingHours);
  }, [schedule, room?.id, form]);

  const handleSubmit = (values: ScheduleFormValues) => {
    if (!room) return;

    if (operatingHours.length === 0) {
      toast.error("Add at least one operating hours entry.");
      return;
    }

    const payload: ScheduleFormPayload = {
      ...values,
      roomId: room.id,
      id: schedule?.id,
      operatingHours,
    };

    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl px-6">
        <DialogHeader>
          <DialogTitle>
            {schedule ? "Edit schedule" : "Create schedule"}
            {room ? ` for ${room.title}` : ``}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Morning availability" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activeFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active from</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires at</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-0.5">
                    <FormLabel>Active schedule</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Turn off to pause this schedule without deleting it.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Operating hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Define days, time windows, and slot durations for bookings.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setOperatingHours((prev) => [
                      ...prev,
                      {
                        dayOfWeek: 1,
                        openingTime: "09:00",
                        closingTime: "17:00",
                        slotDuration: 60,
                      },
                    ])
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add day
                </Button>
              </div>

              <div className="space-y-2">
                {operatingHours.map((entry, idx) => (
                  <div
                    key={`${idx}-${entry.dayOfWeek}-${entry.openingTime}`}
                    className="grid gap-2 rounded-md border p-3 sm:grid-cols-5 sm:items-center"
                  >
                    <div className="space-y-1">
                      <FormLabel className="text-xs uppercase text-muted-foreground">
                        Day
                      </FormLabel>
                      <Select
                        value={String(entry.dayOfWeek)}
                        onValueChange={(value) =>
                          setOperatingHours((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, dayOfWeek: Number(value) } : item
                            )
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dayNames.map((day, value) => (
                            <SelectItem key={day} value={String(value)}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <FormLabel className="text-xs uppercase text-muted-foreground">
                        Opens
                      </FormLabel>
                      <Input
                        type="time"
                        value={entry.openingTime}
                        onChange={(e) =>
                          setOperatingHours((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, openingTime: e.target.value } : item
                            )
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <FormLabel className="text-xs uppercase text-muted-foreground">
                        Closes
                      </FormLabel>
                      <Input
                        type="time"
                        value={entry.closingTime}
                        onChange={(e) =>
                          setOperatingHours((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, closingTime: e.target.value } : item
                            )
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <FormLabel className="text-xs uppercase text-muted-foreground">
                        Slot (minutes)
                      </FormLabel>
                      <Input
                        type="number"
                        min={5}
                        value={entry.slotDuration}
                        onChange={(e) =>
                          setOperatingHours((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, slotDuration: Number(e.target.value) }
                                : item
                            )
                          )
                        }
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setOperatingHours((prev) => prev.filter((_, i) => i !== idx))
                        }
                        disabled={operatingHours.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {operatingHours.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add at least one operating hours entry.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {schedule ? "Save changes" : "Create schedule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const blackoutFormSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  reason: z.string().optional(),
});

type BlackoutFormValues = z.infer<typeof blackoutFormSchema>;

function BlackoutModal({
  room,
  schedule,
  blackout,
  isOpen,
  onClose,
  onSave,
}: {
  room: RoomWithSchedules | null;
  schedule: ScheduleWithDetails | null;
  blackout: BlackoutItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: BlackoutPayload) => void;
}) {
  const form = useForm<BlackoutFormValues>({
    resolver: zodResolver(blackoutFormSchema),
    defaultValues: {
      startTime: blackout?.startTime
        ? toInputDateTime(blackout.startTime)
        : toInputDateTime(new Date()),
      endTime: blackout?.endTime ? toInputDateTime(blackout.endTime) : "",
      reason: blackout?.reason ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      startTime: blackout?.startTime
        ? toInputDateTime(blackout.startTime)
        : toInputDateTime(new Date()),
      endTime: blackout?.endTime ? toInputDateTime(blackout.endTime) : "",
      reason: blackout?.reason ?? "",
    });
  }, [schedule?.id, blackout?.id, room?.id, form]);

  const handleSubmit = (values: BlackoutFormValues) => {
    if (!room || !schedule) return;
    const start = new Date(values.startTime);
    const end = new Date(values.endTime);

    if (end <= start) {
      form.setError("endTime", {
        message: "End time must be after start time.",
      });
      return;
    }

    onSave({
      ...values,
      blackoutId: blackout?.id,
      scheduleId: schedule.id,
      roomId: room.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add blackout {schedule ? `for ${schedule.name}` : ``}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Maintenance, cleaning, upgrades..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save blackout</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
