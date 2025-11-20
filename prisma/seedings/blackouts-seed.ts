import { PrismaClient, Prisma } from "@/generated/prisma/client";

export default {
  seed: async (prisma: PrismaClient) => {
    const schedules = await prisma.schedule.findMany();

    if (schedules.length === 0) {
      console.log("Please seed schedules first.");
      return;
    }

    const data: Prisma.BlackoutCreateInput[] = [
      {
        schedule: { connect: { id: schedules[0].id } },
        startTime: new Date("2025-07-04T00:00:00Z"),
        endTime: new Date("2025-07-04T23:59:59Z"),
        reason: "Independence Day",
      },
      {
        schedule: { connect: { id: schedules[0].id } },
        startTime: new Date("2025-11-27T00:00:00Z"),
        endTime: new Date("2025-11-27T23:59:59Z"),
        reason: "Thanksgiving Day",
      },
      {
        schedule: { connect: { id: schedules[0].id } },
        startTime: new Date("2025-12-25T00:00:00Z"),
        endTime: new Date("2025-12-25T23:59:59Z"),
        reason: "Christmas Day",
      },
    ];

    for (const blackout of data) {
      await prisma.blackout.create({ data: blackout });
    }
  },
};
