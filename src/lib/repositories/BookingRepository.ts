import { BookingStatus } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export const getBookingsForRoomBetweenPeriod = async (
  roomId: string,
  start: Date,
  end: Date
) => {
  return prisma.booking.findMany({
    where: {
      roomId,
      startTime: {
        lt: end,
      },
      endTime: {
        gt: start,
      },
    },
  });
};

export const createBooking = async (
  userId: string,
  roomId: string,
  startTime: Date,
  endTime: Date
) => {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
      startTime,
      endTime,
    },
  });
};

export const getAllBookings = async () => {
  return prisma.booking.findMany();
};

export const getBookingsByUserId = async (userId: string) => {
  return prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      room: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });
};

export const getAllBookingsWithRelations = async () => {
  return prisma.booking.findMany({
    include: {
      user: true,
      room: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      user: true,
      room: true,
    },
  });
};
