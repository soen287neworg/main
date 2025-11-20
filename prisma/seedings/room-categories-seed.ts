import { PrismaClient, Prisma } from "@/generated/prisma/client";

const data: Prisma.RoomCategoryCreateInput[] = [
  {
    label: "Meeting Room",
    slug: "meeting-room",
  },
  {
    label: "Office",
    slug: "office",
  },
  {
    label: "Focus Room",
    slug: "focus-room",
  },
];

export default {
  seed: async (prisma: PrismaClient) => {
    await prisma.roomCategory.createMany({ data });
  },
};
