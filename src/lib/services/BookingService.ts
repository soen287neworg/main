import * as BookingRepository from "@/lib/repositories/BookingRepository";
import * as ScheduleService from "@/lib/services/ScheduleService";
import { OperatingHours, Blackout } from "@/generated/prisma/client";
import { add, set } from "date-fns";
import { Slot, SlotStatus } from "@/lib/types/booking";

export const getAvailabilitiesForToday = async (roomId: string) => {
  const availabilities = await getAvailabilities(roomId, new Date());

  return availabilities;
};

export const getAvailabilities = async (roomId: string, date: Date) => {
  const startOfDay = set(date, { hours: 0, minutes: 0, seconds: 0 });
  const endOfDay = set(date, { hours: 23, minutes: 59, seconds: 59 });

  const schedule = await ScheduleService.getActiveScheduleForRoom(
    roomId,
    startOfDay
  );

  const bookings = await BookingRepository.getBookingsForRoomBetweenPeriod(
    roomId,
    startOfDay,
    endOfDay
  );

  const operatingHours: OperatingHours | undefined =
    schedule?.operatingHours.find(
      (oh: OperatingHours) => oh.dayOfWeek === startOfDay.getDay()
    );

  if (!operatingHours) {
    return [];
  }

  const openingTime = operatingHours.openingTime.split(":").map(Number);
  const closingTime = operatingHours.closingTime.split(":").map(Number);

  const openingDateTime = set(startOfDay, {
    hours: openingTime[0],
    minutes: openingTime[1],
  });
  const closingDateTime = set(startOfDay, {
    hours: closingTime[0],
    minutes: closingTime[1],
  });

  let currentTime = openingDateTime;
  const slots: Slot[] = [];

  while (currentTime < closingDateTime) {
    const slotEndTime = add(currentTime, {
      minutes: operatingHours.slotDuration,
    });

    const isBooked = bookings.some(
      (booking) =>
        currentTime < booking.endTime && slotEndTime > booking.startTime
    );
    const isBlackout = schedule?.blackouts.some(
      (blackout: Blackout) =>
        currentTime < blackout.endTime && slotEndTime > blackout.startTime
    );

    let status: SlotStatus = SlotStatus.AVAILABLE;

    if (isBooked) {
      status = SlotStatus.BOOKED;
    } else if (isBlackout) {
      status = SlotStatus.UNAVAILABLE;
    } else if (currentTime.getTime() < new Date().getTime()) {
      status = SlotStatus.CLOSED;
    }

    slots.push({
      startTime: currentTime,
      endTime: slotEndTime,
      status: status,
    });
    currentTime = slotEndTime;
  }

  return slots;
};

import * as RoomRepository from "@/lib/repositories/RoomRepository";
import { startOfDay } from "date-fns";
import { Room, Booking } from "@/generated/prisma/client";

export const getDashboardAnalytics = async () => {
  const rooms = await RoomRepository.getPublicRooms();
  const allBookings = await BookingRepository.getAllBookings();

  const roomCounts = await getRoomCounts(rooms, allBookings);
  const timeSlotMetrics = getTimeSlotMetrics(allBookings);
  const roomBookingMetrics = getRoomBookingMetrics(rooms, allBookings);

  return {
    roomCounts,
    timeSlotMetrics,
    roomBookingMetrics,
  };
};

export const getRoomCounts = async (rooms: Room[], bookings: Booking[]) => {
  const now = new Date();
  const todaysBookedRoomIds = new Set(
    bookings
      .filter(
        (b) =>
          now >= b.startTime &&
          now <= b.endTime &&
          startOfDay(b.startTime) === startOfDay(now)
      )
      .map((b) => b.roomId)
  );

  const bookedCount = todaysBookedRoomIds.size;
  const openCount = rooms.length - bookedCount;

  return {
    booked: bookedCount,
    open: openCount,
  };
};

export const getTimeSlotMetrics = (bookings: Booking[]) => {
  const timeSlotCounts: Record<string, number> = {};

  bookings.forEach((booking) => {
    const timeSlot = booking.startTime.toTimeString().slice(0, 5);
    timeSlotCounts[timeSlot] = (timeSlotCounts[timeSlot] || 0) + 1;
  });

  const timeSlots = Object.entries(timeSlotCounts);
  if (timeSlots.length === 0) {
    return {
      mostBooked: "N/A",
      leastBooked: "N/A",
      occupancy: [],
    };
  }

  const [mostBooked] = timeSlots.reduce((a, b) => (b[1] > a[1] ? b : a));
  const [leastBooked] = timeSlots.reduce((a, b) => (b[1] < a[1] ? b : a));

  return {
    mostBooked: mostBooked[0],
    leastBooked: leastBooked[0],
    occupancy: timeSlots
      .map(([time, count]) => ({
        time,
        occupancy: count,
      }))
      .sort((a, b) =>
        b.occupancy === a.occupancy
          ? a.time.localeCompare(b.time)
          : b.occupancy - a.occupancy
      ),
  };
};

export const getRoomBookingMetrics = (rooms: Room[], bookings: Booking[]) => {
  const roomBookingCounts: Record<string, number> = {};

  bookings.forEach((booking) => {
    roomBookingCounts[booking.roomId] =
      (roomBookingCounts[booking.roomId] || 0) + 1;
  });

  if (rooms.length === 0) {
    return {
      mostBooked: "N/A",
      leastBooked: "N/A",
    };
  }

  let mostBookedRoomId = rooms[0].id;
  let leastBookedRoomId = rooms[0].id;

  rooms.forEach((room) => {
    if (
      (roomBookingCounts[room.id] || 0) >
      (roomBookingCounts[mostBookedRoomId] || 0)
    ) {
      mostBookedRoomId = room.id;
    }
    if (
      (roomBookingCounts[room.id] || 0) <
      (roomBookingCounts[leastBookedRoomId] || 0)
    ) {
      leastBookedRoomId = room.id;
    }
  });

  const mostBookedRoom = rooms.find((r) => r.id === mostBookedRoomId)?.title;
  const leastBookedRoom = rooms.find((r) => r.id === leastBookedRoomId)?.title;

  return {
    mostBooked: mostBookedRoom || "N/A",
    leastBooked: leastBookedRoom || "N/A",
  };
};
