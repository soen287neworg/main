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

export const getAllBookings = async () => {
  return prisma.booking.findMany();
};
