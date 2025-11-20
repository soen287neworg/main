import { PrismaClient, Prisma } from "@/generated/prisma/client";

const data: Prisma.RoleCreateInput[] = [
  {
    name: "Admin",
  },
  {
    name: "User",
  },
  {
    name: "Guest",
  },
];

export default {
  seed: async (prisma: PrismaClient) => {
    await prisma.role.createMany({ data });
  },
};
