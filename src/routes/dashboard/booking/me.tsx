import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserBookings } from "@/lib/services/BookingService";
import { getSessionFn } from "@/lib/controllers/AuthController";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { createServerFn } from "@tanstack/react-start";

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

export const Route = createFileRoute("/dashboard/booking/me")({
  component: RouteComponent,
  async beforeLoad() {
    const sess = await getSessionFn();

    if (!sess?.user) {
      throw redirect({ to: "/user/auth/login" });
    }
  },
  async loader() {
    return await getBookings();
  },
});

function RouteComponent() {
  const bookings = Route.useLoaderData();

  if (!bookings) {
    return <div>Could not load bookings.</div>;
  }

  const { upcomingBookings, pastBookings, cancelledBookings } = bookings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled / Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <BookingTable bookings={upcomingBookings} />
          </TabsContent>
          <TabsContent value="past">
            <BookingTable bookings={pastBookings} />
          </TabsContent>
          <TabsContent value="cancelled">
            <BookingTable bookings={cancelledBookings} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function BookingTable({ bookings }: { bookings: any[] }) {
  if (bookings.length === 0) {
    return <p>No bookings to display.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.room.title}</TableCell>
            <TableCell>{format(booking.startTime, "PPP")}</TableCell>
            <TableCell>
              {format(booking.startTime, "p")} - {format(booking.endTime, "p")}
            </TableCell>
            <TableCell>{booking.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
