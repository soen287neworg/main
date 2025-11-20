import { PrismaClient, Prisma } from "@/generated/prisma/client";

export default {
  seed: async (prisma: PrismaClient) => {
    const rooms = await prisma.room.findMany();

    if (rooms.length === 0) {
      console.log("Please seed rooms first.");
      return;
    }

    const data: Prisma.ScheduleCreateInput[] = [
      {
        room: { connect: { id: rooms[0].id } },
        name: "Regular Hours",
        priority: 1,
        activeFrom: new Date("2025-01-01T00:00:00Z"),
        isActive: true,
      },
      {
        room: { connect: { id: rooms[0].id } },
        name: "Holiday Hours",
        priority: 2,
        activeFrom: new Date("2025-12-24T00:00:00Z"),
        expiresAt: new Date("2025-12-26T23:59:59Z"),
        isActive: true,
      },
      {
        room: { connect: { id: rooms[0].id } },
        name: "Maintenance",
        priority: 10,
        activeFrom: new Date("2026-01-10T00:00:00Z"),
        expiresAt: new Date("2026-01-11T23:59:59Z"),
        isActive: false,
      },
    ];

    for (const schedule of data) {
      await prisma.schedule.create({ data: schedule });
    }
  },
};
