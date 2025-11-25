import { createFileRoute, redirect, useLoaderData } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { getDashboardAnalytics } from "@/lib/services/BookingService";
import { createServerFn } from "@tanstack/react-start";
import { BitfieldSystemDefinitions } from "@/lib/types/roles";
import { assertPermission, checkPermission } from "@/lib/utils/permissions";

const verifyAnalyticsAccess = createServerFn({ method: "GET" }).handler(
  async () => checkPermission(BitfieldSystemDefinitions.MANAGE_ANALYTICS)
);

const getAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  await assertPermission(BitfieldSystemDefinitions.MANAGE_ANALYTICS);
  return getDashboardAnalytics();
});

export const Route = createFileRoute("/dashboard/admin/analytics")({
  component: RouteComponent,
  async beforeLoad() {
    const { hasSession, allowed } = await verifyAnalyticsAccess();

    if (!hasSession) {
      throw redirect({ to: "/user/auth/login" });
    }

    if (!allowed) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    return getAnalytics();
  },
});

function RouteComponent() {
  const analytics = useLoaderData({ from: "/dashboard/admin/analytics" });

  return (
    <div>
      <h1 className="text-4xl font-bold">Analytics</h1>
      <br />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Booked Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.roomCounts.booked}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analytics.roomCounts.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Booked Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analytics.roomBookingMetrics.mostBooked}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Least Booked Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analytics.roomBookingMetrics.leastBooked}
            </p>
          </CardContent>
        </Card>
        <Card className="w-240 h-135">
          <CardHeader>
            <CardTitle>Time Slot Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full"
              config={{
                occupancy: {
                  label: "Occupancy",
                  color: "hsl(var(--primary))",
                },
              }}
            >
              <LineChart data={analytics.timeSlotMetrics.occupancy}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={false}
                />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="var(--color-occupancy)"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
