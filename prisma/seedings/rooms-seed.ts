import { PrismaClient, Prisma } from "@/generated/prisma/client";

const data: Prisma.RoomCreateInput[] = [
  {
    number: "A103",
    title: "Supply Closet",
    description: "Private room for your private needs ;)",
    note: "Please keep the noise down",
    level: "2nd Floor",
    capacity: 2,
    active: true,
  },
];

export default {
  seed: async (prisma: PrismaClient) => {
    await prisma.room.createMany({ data });
  },
};
