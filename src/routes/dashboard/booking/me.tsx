import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Booking, Room } from "@/generated/prisma/client";
import { getSessionFn } from "@/lib/controllers/AuthController";
import {
  changeBookingStatus,
  getUserBookings,
} from "@/lib/services/BookingService";
import { listCategoriesWithRooms } from "@/lib/services/RoomCategoryService";
import { BookingStatus } from "@/lib/types/booking";
import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarClock, Clock3, Loader2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getBookings = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      upcomingBookings: [],
      pastBookings: [],
      cancelledBookings: [],
    };
  }
  const bookings = await getUserBookings(userId);
  return bookings;
});

const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  return await listCategoriesWithRooms();
});

const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((data: { bookingId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to cancel a booking.");
    }

    const { upcomingBookings } = await getUserBookings(userId);
    const booking = upcomingBookings.find((b) => b.id === data.bookingId);

    if (!booking) {
      throw new Error("Booking not found or no longer eligible to cancel.");
    }

    if (new Date(booking.startTime) <= new Date()) {
      throw new Error("This booking has already started.");
    }

    return changeBookingStatus(data.bookingId, BookingStatus.CANCELLED);
  });

export const Route = createFileRoute("/dashboard/booking/me")({
  component: RouteComponent,
  async beforeLoad() {
    const sess = await getSessionFn();

    if (!sess?.user) {
      throw redirect({ to: "/user/auth/login" });
    }
  },
  async loader() {
    const [bookings, categories] = await Promise.all([
      getBookings(),
      getCategories(),
    ]);

    return { bookings, categories };
  },
});

type BookingWithRoom = Booking & { room: Room };
type LoaderData = {
  bookings: Awaited<ReturnType<typeof getBookings>>;
  categories: Awaited<ReturnType<typeof getCategories>>;
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

const statusBadgeClasses: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
  REJECTED: "bg-red-50 text-red-700 border-red-100",
};

function RouteComponent() {
  const { bookings, categories } = Route.useLoaderData() as LoaderData;

  const [tab, setTab] = useState("upcoming");
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithRoom[]>(
    () => bookings?.upcomingBookings.map(normalizeBookingDates) ?? []
  );
  const [pastBookings, setPastBookings] = useState<BookingWithRoom[]>(
    () => bookings?.pastBookings.map(normalizeBookingDates) ?? []
  );
  const [cancelledBookings, setCancelledBookings] = useState<BookingWithRoom[]>(
    () => bookings?.cancelledBookings.map(normalizeBookingDates) ?? []
  );
  const [pendingCancel, setPendingCancel] = useState<BookingWithRoom | null>(
    null
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filterBookingsByCategory = (list: BookingWithRoom[]) => {
    if (categoryFilter === "all") return list;
    if (categoryFilter === "uncategorized") {
      return list.filter((booking) => !booking.room.categoryId);
    }
    return list.filter((booking) => booking.room.categoryId === categoryFilter);
  };

  const filteredUpcomingBookings = useMemo(
    () => filterBookingsByCategory(upcomingBookings),
    [upcomingBookings, categoryFilter]
  );
  const filteredPastBookings = useMemo(
    () => filterBookingsByCategory(pastBookings),
    [pastBookings, categoryFilter]
  );
  const filteredCancelledBookings = useMemo(
    () => filterBookingsByCategory(cancelledBookings),
    [cancelledBookings, categoryFilter]
  );

  if (!bookings) {
    return <div>Could not load bookings.</div>;
  }

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;

    setCancellingId(pendingCancel.id);
    try {
      const updated = (await cancelBooking({
        data: { bookingId: pendingCancel.id },
      })) as BookingWithRoom;
      const normalizedUpdate = normalizeBookingDates(updated);

      setUpcomingBookings((prev) =>
        prev.filter((booking) => booking.id !== pendingCancel.id)
      );
      setCancelledBookings((prev) => [normalizedUpdate, ...prev]);

      toast.success("Booking cancelled.");
      setTab("cancelled");
    } catch (error: any) {
      const message =
        error?.message ||
        error?.result?.error ||
        "Unable to cancel booking. Please try again.";
      toast.error(message);
    } finally {
      setCancellingId(null);
      setPendingCancel(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>My Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review upcoming, past, and cancelled bookings. Cancel future bookings if your plans
              change.
            </p>
          </div>
          <div className="flex flex-col gap-1 md:items-end">
            <p className="text-sm text-muted-foreground">Filter by category</p>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="flex w-full flex-wrap gap-2">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                Upcoming
                <Badge variant="outline">
                  {filteredUpcomingBookings.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                Past
                <Badge variant="outline">{filteredPastBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                Cancelled / Rejected
                <Badge variant="outline">
                  {filteredCancelledBookings.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <BookingTable
                bookings={filteredUpcomingBookings}
                allowCancel
                cancellingId={cancellingId}
                onCancel={setPendingCancel}
              />
            </TabsContent>
            <TabsContent value="past">
              <BookingTable bookings={filteredPastBookings} />
            </TabsContent>
            <TabsContent value="cancelled">
              <BookingTable bookings={filteredCancelledBookings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => {
          if (!open && !cancellingId) setPendingCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCancel ? (
                <>
                  You are cancelling <strong>{pendingCancel.room.title}</strong> on{" "}
                  {formatDate(pendingCancel.startTime)} at{" "}
                  {formatTimeRange(pendingCancel.startTime, pendingCancel.endTime)}.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingId === pendingCancel?.id}>
              Keep booking
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmCancel}
              disabled={cancellingId === pendingCancel?.id}
            >
              {cancellingId === pendingCancel?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BookingTable({
  bookings,
  allowCancel = false,
  cancellingId,
  onCancel,
}: {
  bookings: BookingWithRoom[];
  allowCancel?: boolean;
  cancellingId?: string | null;
  onCancel?: (booking: BookingWithRoom) => void;
}) {
  if (bookings.length === 0) {
    return (
      <Empty className="border bg-muted/30">
        <EmptyMedia variant="icon">
          <CalendarClock className="h-5 w-5" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No bookings yet</EmptyTitle>
          <EmptyDescription>
            You will see all of your bookings here once you schedule a room.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }
  return (
    <div className="mt-4 overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[260px]">Room</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-semibold leading-none">
                    {booking.room.title}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Room {booking.room.number}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(booking.startTime)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${statusBadgeClasses[booking.status]} px-3 py-1 text-xs font-medium`}
                >
                  {statusLabels[booking.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {allowCancel &&
                booking.status !== BookingStatus.CANCELLED &&
                booking.status !== BookingStatus.REJECTED ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    disabled={cancellingId === booking.id}
                    onClick={() => onCancel?.(booking)}
                  >
                    {cancellingId === booking.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancel
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(date: Date | string) {
  return format(new Date(date), "PPP");
}

function formatTimeRange(start: Date | string, end: Date | string) {
  return `${format(new Date(start), "p")} - ${format(new Date(end), "p")}`;
}

function normalizeBookingDates(booking: BookingWithRoom): BookingWithRoom {
  return {
    ...booking,
    startTime: new Date(booking.startTime),
    endTime: new Date(booking.endTime),
  };
}
