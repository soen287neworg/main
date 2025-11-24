import { UserCreateInput, UserUpdateInput } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";

export const findUserById = async (userId: string) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};
export const findAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      roles: true,
    },
  });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const createUser = async (data: UserCreateInput) => {
  return prisma.user.create({ data });
};

export const updateUser = async (userId: string, data: UserUpdateInput) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};
