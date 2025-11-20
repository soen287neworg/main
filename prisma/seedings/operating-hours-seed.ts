import { PrismaClient, Prisma } from "@/generated/prisma/client";

export default {
  seed: async (prisma: PrismaClient) => {
    const schedules = await prisma.schedule.findMany();

    if (schedules.length === 0) {
      console.log("Please seed schedules first.");
      return;
    }

    const data: Prisma.OperatingHoursCreateInput[] = [
      // Regular Hours
      {
        schedule: { connect: { id: schedules[0].id } },
        dayOfWeek: 1, // Monday
        openingTime: "09:00",
        closingTime: "17:00",
        slotDuration: 60,
      },
      {
        schedule: { connect: { id: schedules[0].id } },
        dayOfWeek: 2, // Tuesday
        openingTime: "09:00",
        closingTime: "17:00",
        slotDuration: 60,
      },
      {
        schedule: { connect: { id: schedules[0].id } },
        dayOfWeek: 3, // Wednesday
        openingTime: "09:00",
        closingTime: "17:00",
        slotDuration: 60,
      },
    ];

    for (const operatingHour of data) {
      await prisma.operatingHours.create({ data: operatingHour });
    }
  },
};
