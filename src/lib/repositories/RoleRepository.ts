import prisma from "../prisma";

/**
 * Finds a role by its name.
 * @param name - The name of the role to find.
 * @returns The role object or null if not found.
 */
export const findRoleByName = async (name: string) => {
  return await prisma.role.findUnique({
    where: { name },
  });
};

export const findAllRoles = async () => {
  return await prisma.role.findMany();
};

/**
 * Connects a user to a role.
 * @param userId - The ID of the user.
 * @param roleId - The ID of the role.
 * @returns The updated user object.
 */
export const connectRoleToUser = async (userId: string, roleId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        connect: { id: roleId },
      },
    },
  });
};

export const disconnectRoleFromUser = async (
  userId: string,
  roleId: string
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        disconnect: { id: roleId },
      },
    },
  });
};
