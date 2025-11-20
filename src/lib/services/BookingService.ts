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
