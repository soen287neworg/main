import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { getDashboardAnalytics } from "@/lib/services/BookingService";

export const Route = createFileRoute("/dashboard/analytics")({
  component: RouteComponent,
  loader: async () => {
    return getDashboardAnalytics();
  },
});

function RouteComponent() {
  const analytics = useLoaderData({ from: "/dashboard/analytics" });

  return (
    
    <div>
      <h1 className="text-6xl font-bold">Analytics</h1>
      <br/>
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
