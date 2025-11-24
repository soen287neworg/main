import { Slot } from "@/lib/types/booking";
import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";

interface TimeTableProps {
  slots: Slot[];
  selectHook: Dispatch<SetStateAction<Slot | null>>;
}

export const statusColors = {
  AVAILABLE: "bg-green-200 hover:bg-green-300 cursor-pointer",
  CLOSED: "bg-gray-300 text-gray-500",
  BOOKED: "bg-red-300 text-red-600",
  UNAVAILABLE: "bg-yellow-300 text-yellow-600",
};

export const legendColors = {
  AVAILABLE: "w-4 h-4 bg-green-200 rounded-full",
  CLOSED: "w-4 h-4 bg-gray-300 rounded-full",
  BOOKED: "w-4 h-4 bg-red-300 rounded-full",
  UNAVAILABLE: "w-4 h-4 bg-yellow-300 rounded-full",
};

export function TimeTable({ slots, selectHook }: TimeTableProps) {
  if (slots.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No slots available for this day.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">
        Available Slots
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot, index) => {
          const { startTime, status } = slot;
          const time = format(new Date(startTime), "HH:mm");
          const color = statusColors[status];

          return (
            <div
              key={index}
              className={`p-2 border rounded-lg flex justify-center items-center text-center ${color}`}
              onClick={() => selectHook(slot)}
            >
              <span className="font-medium">{time}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-4 border rounded-lg">
        <h4 className="text-lg font-semibold mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-200 rounded-full"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-300 rounded-full"></span>
            <span>Closed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-300 rounded-full"></span>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-300 rounded-full"></span>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
