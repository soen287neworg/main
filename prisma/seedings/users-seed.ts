import { PrismaClient, Prisma } from "@/generated/prisma/client";

const data: Prisma.UserCreateInput[] = [
  {
    email: "john.doe@example.com",
    name: "John Doe",
    emailVerified: false,
  },
  {
    email: "jane.doe@example.com",
    name: "Jane Doe",
    emailVerified: false,
  },
  {
    email: "peter.jones@example.com",
    name: "Peter Jones",
    emailVerified: false,
  },
];

export default {
  name: "users",
  seed: async (prisma: PrismaClient) => {
    await prisma.user.createMany({ data });
  },
  dependsOn: [],
};
