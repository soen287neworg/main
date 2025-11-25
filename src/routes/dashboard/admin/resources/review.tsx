import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Booking,
  BookingStatus as BookingStatusEnum,
  Room,
  User,
} from "@/generated/prisma/client";
import {
  changeBookingStatus,
  getAllBookingsWithRelations,
} from "@/lib/services/BookingService";
import { cn } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { CheckCircle2, Clock3, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type BookingWithRelations = Booking & { user: User; room: Room };
type BookingStatusValue = BookingStatusEnum;
type FilterOption = "ALL" | BookingStatusValue;

const BOOKING_STATUS: Record<BookingStatusValue, BookingStatusValue> = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
};

const statusBadgeClasses: Record<BookingStatusValue, string> = {
  [BOOKING_STATUS.PENDING]:
    "bg-amber-100 text-amber-800 border-transparent",
  [BOOKING_STATUS.CONFIRMED]:
    "bg-emerald-100 text-emerald-800 border-transparent",
  [BOOKING_STATUS.CANCELLED]:
    "bg-gray-200 text-gray-700 border-transparent",
  [BOOKING_STATUS.REJECTED]: "bg-red-100 text-red-700 border-transparent",
};

const statusLabels: Record<BookingStatusValue, string> = {
  [BOOKING_STATUS.PENDING]: "Pending",
  [BOOKING_STATUS.CONFIRMED]: "Approved",
  [BOOKING_STATUS.CANCELLED]: "Cancelled",
  [BOOKING_STATUS.REJECTED]: "Rejected",
};

const tabOptions: { value: FilterOption; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: BOOKING_STATUS.PENDING, label: "Pending" },
  { value: BOOKING_STATUS.CONFIRMED, label: "Approved" },
  { value: BOOKING_STATUS.REJECTED, label: "Rejected" },
  { value: BOOKING_STATUS.CANCELLED, label: "Cancelled" },
];

export const getBookings = createServerFn({ method: "GET" }).handler(async () => {
  return getAllBookingsWithRelations();
});

export const updateBookingStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { bookingId: string; status: BookingStatusEnum }) => data)
  .handler(async ({ data }) => {
    return changeBookingStatus(data.bookingId, data.status);
  });

export const Route = createFileRoute("/dashboard/admin/resources/review")({
  component: RouteComponent,
  loader: () => getBookings(),
});

function RouteComponent() {
  const initialBookings = Route.useLoaderData() as BookingWithRelations[];
  const [bookings, setBookings] = useState<BookingWithRelations[]>(initialBookings);
  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const counts = useMemo(
    () => {
      return bookings.reduce(
        (acc, booking) => {
          acc.all += 1;
          acc[booking.status] += 1;
          return acc;
        },
        {
          all: 0,
          [BOOKING_STATUS.PENDING]: 0,
          [BOOKING_STATUS.CONFIRMED]: 0,
          [BOOKING_STATUS.REJECTED]: 0,
          [BOOKING_STATUS.CANCELLED]: 0,
        } as Record<BookingStatusValue | "all", number>
      );
    },
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = filter === "ALL" ? true : booking.status === filter;
      const matchesQuery =
        !query ||
        booking.user.name?.toLowerCase().includes(query) ||
        booking.user.email.toLowerCase().includes(query) ||
        booking.room.title.toLowerCase().includes(query) ||
        booking.room.number.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [bookings, filter, search]);

  const handleStatusUpdate = async (
    bookingId: string,
    status: BookingStatusEnum
  ) => {
    const currentBooking = bookings.find((b) => b.id === bookingId);
    if (!currentBooking) return;

    setUpdatingId(bookingId);

    // Optimistically move the booking into its new status section.
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );

    try {
      const updated = await updateBookingStatusFn({
        data: { bookingId, status },
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updated } : booking
        )
      );

      toast.success(
        status === BOOKING_STATUS.CONFIRMED
          ? "Booking approved."
          : "Booking rejected."
      );
    } catch (error: any) {
      // Revert optimistic update if the backend fails.
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? currentBooking : booking
        )
      );

      const message =
        error?.message ||
        error?.result?.error ||
        "Unable to update booking. Please try again.";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Booking Review</h1>
        <p className="text-sm text-muted-foreground">
          View every booking request across rooms and approve or reject with confidence.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filter incoming bookings and keep the queue tidy.
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or room"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as FilterOption)}
            className="w-full"
          >
            <TabsList className="flex w-full flex-wrap gap-2">
              {tabOptions.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  {tab.label}
                  <Badge variant="outline" className="border-border bg-background text-xs">
                    {tab.value === "ALL"
                      ? counts.all
                      : counts[tab.value as BookingStatusValue]}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Requester</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No bookings match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredBookings.map((booking) => {
                  const actionsDisabled = updatingId === booking.id;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {booking.user.name
                                ? booking.user.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")
                                    .toUpperCase()
                                : booking.user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="font-medium leading-tight">
                              {booking.user.name || "Unknown user"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{booking.room.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Room {booking.room.number} / Level {booking.room.level}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock3 className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(booking.startTime), "PP")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(booking.startTime), "p")} to {format(new Date(booking.endTime), "p")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("px-3 py-1 text-xs font-medium", statusBadgeClasses[booking.status])}>
                          {statusLabels[booking.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            disabled={actionsDisabled}
                            onClick={() =>
                              handleStatusUpdate(booking.id, BOOKING_STATUS.CONFIRMED)
                            }
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            disabled={actionsDisabled}
                            onClick={() =>
                              handleStatusUpdate(booking.id, BOOKING_STATUS.REJECTED)
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




