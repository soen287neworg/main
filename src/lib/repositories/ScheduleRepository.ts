import prisma from "@/lib/prisma";

export const getActiveScheduleForRoom = async (
  roomId: string,
  targetDate: Date
) => {
  const schedule = await prisma.schedule.findFirst({
    where: {
      roomId,
      isActive: true,
      activeFrom: {
        lte: targetDate,
      },
      OR: [
        {
          expiresAt: {
            gte: targetDate,
          },
        },
        {
          expiresAt: null,
        },
      ],
    },
    orderBy: {
      priority: "desc",
    },
    include: {
      operatingHours: true,
      blackouts: {
        where: {
          startTime: {
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than end of day
          },
          endTime: {
            gt: targetDate, // Greater than start of day
          },
        },
      },
    },
  });

  return schedule;
};
