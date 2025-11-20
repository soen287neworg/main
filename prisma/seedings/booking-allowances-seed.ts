import { PrismaClient, Prisma } from "@/generated/prisma/client";

export default {
  seed: async (prisma: PrismaClient) => {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log("Please seed users first.");
      return;
    }

    const data: Prisma.BookingAllowanceCreateInput[] = [
      {
        user: { connect: { id: users[0].id } },
        minutes: 120,
        validFrom: new Date("2025-01-01T00:00:00Z"),
        expiresAt: new Date("2025-12-31T23:59:59Z"),
        reason: "Monthly allowance",
      },
      {
        user: { connect: { id: users[1].id } },
        minutes: 60,
        validFrom: new Date("2025-06-01T00:00:00Z"),
        expiresAt: new Date("2025-06-30T23:59:59Z"),
        reason: "Trial period",
      },
      {
        user: { connect: { id: users[2].id } },
        minutes: 240,
        validFrom: new Date("2025-01-01T00:00:00Z"),
        expiresAt: new Date("2025-03-31T23:59:59Z"),
        reason: "Quarterly budget",
      },
    ];

    for (const allowance of data) {
      await prisma.bookingAllowance.create({ data: allowance });
    }
  },
};
