import { PrismaClient, Prisma } from "@/generated/prisma/client";

export default {
  name: "bookings",
  seed: async (prisma: PrismaClient) => {
    const users = await prisma.user.findMany();
    const rooms = await prisma.room.findMany();

    if (users.length === 0 || rooms.length === 0) {
      console.log("Please seed users and rooms first.");
      return;
    }

    const data: Prisma.BookingCreateInput[] = [
      {
        user: { connect: { id: users[0].id } },
        room: { connect: { id: rooms[0].id } },
        startTime: new Date("2025-12-01T10:00:00Z"),
        endTime: new Date("2025-12-01T11:00:00Z"),
        status: "CONFIRMED",
      },
      {
        user: { connect: { id: users[1].id } },
        room: { connect: { id: rooms[0].id } },
        startTime: new Date("2025-12-01T14:00:00Z"),
        endTime: new Date("2025-12-01T15:00:00Z"),
        status: "PENDING",
      },
      {
        user: { connect: { id: users[2].id } },
        room: { connect: { id: rooms[0].id } },
        startTime: new Date("2025-12-02T09:00:00Z"),
        endTime: new Date("2025-12-02T10:00:00Z"),
        status: "CANCELLED",
      },
    ];

    for (const booking of data) {
      await prisma.booking.create({ data: booking });
    }
  },
  dependsOn: ["users", "rooms"],
};
