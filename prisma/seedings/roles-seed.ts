import { PrismaClient, Prisma } from "@/generated/prisma/client";

const data: Prisma.RoleCreateInput[] = [
  {
    name: "Admin",
  },
  {
    name: "Staff",
  },
  {
    name: "Student",
  },
];

export default {
  name: "roles",
  seed: async (prisma: PrismaClient) => {
    await prisma.role.createMany({ data });
  },
  dependsOn: [],
};
