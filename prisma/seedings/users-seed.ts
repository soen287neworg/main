import { PrismaClient, Prisma } from "@/generated/prisma/client";

const data: Prisma.UserCreateInput[] = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    name: "John Doe",
  },
  {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    name: "Jane Doe",
  },
  {
    firstName: "Peter",
    lastName: "Jones",
    email: "peter.jones@example.com",
    name: "Peter Jones",
  },
];

export default {
  seed: async (prisma: PrismaClient) => {
    await prisma.user.createMany({ data });
  },
};
