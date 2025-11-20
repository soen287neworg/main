import { Room } from "@/generated/prisma/client";
import {
  getAvailabilities,
  getAvailabilitiesForToday,
} from "@/lib/services/BookingService";
import { getPublicRoomById } from "@/lib/services/RoomService";
import { Slot } from "@/lib/types/booking";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TimeTable } from "@/components/TimeTable";

export const getRoomDetails = createServerFn({ method: "GET" })
  .inputValidator((data: { roomId: string }) => data)
  .handler(async ({ data }) => {
    const [room, availabilities] = await Promise.all([
      getPublicRoomById(data.roomId),
      getAvailabilitiesForToday(data.roomId),
    ]);

    return { room, availabilities };
  });

export const getRoomAvailabilities = createServerFn({ method: "POST" })
  .inputValidator((data: { roomId: string; date: Date }) => data)
  .handler(async ({ data }) => {
    const availabilities = await getAvailabilities(data.roomId, data.date);
    return availabilities;
  });

export const Route = createFileRoute("/booking/rooms/$roomId")({
  component: RouteComponent,
  loader: ({ params: { roomId } }) => getRoomDetails({ data: { roomId } }),
});

function RouteComponent() {
  const {
    room,
    availabilities: initialAvailabilities,
  }: { room: Room; availabilities: Slot[] } = Route.useLoaderData();
  const { roomId } = Route.useParams();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availabilities, setAvailabilities] = useState<Slot[]>(
    initialAvailabilities
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setIsLoading(true);
    try {
      const newAvailabilities = await getRoomAvailabilities({
        data: { roomId, date: selectedDate },
      });
      setAvailabilities(newAvailabilities);
    } catch (error) {
      console.error("Failed to fetch availabilities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-1/3">
          <img
            src={room.imageUrl}
            alt={room.title}
            className="w-100 h-100 object-cover rounded-lg shadow-lg mb-4"
          />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{room.title}</h2>
            <p className="text-lg text-gray-600">{room.description}</p>
            <p className="text-sm text-gray-500 pt-4">
              {room.active ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-200 rounded-full"></span>
                  <p>Available for booking</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-200 rounded-full"></span>
                  <p>Unavailable</p>
                </div>
              )}
            </p>
            <hr className="my-4" />
            <div>
              <p className="font-semibold">Room Number:</p>
              <p>{room.number}</p>
            </div>
            <div>
              <p className="font-semibold">Level:</p>
              <p>{room.level}</p>
            </div>
            <div>
              <p className="font-semibold">Capacity:</p>
              <p>{room.capacity} people</p>
            </div>
            {room.note && (
              <div>
                <p className="font-semibold">Note:</p>
                <p className="text-sm italic">{room.note}</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-2/3 mt-8 md:mt-0">
          <div className="flex flex-row">
            <h3 className="text-xl font-semibold mb-4">Select a Date</h3>
            <div className="md:w-1/2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={"w-full justify-start text-left font-normal"}
                  >
                    {date ? date.toLocaleDateString() : "Choose a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    animate
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:w-1/2">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <TimeTable slots={availabilities} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
