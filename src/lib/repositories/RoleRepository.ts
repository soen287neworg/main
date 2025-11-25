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
  return await prisma.role.findMany({
    include: {
      users: true,
      systemPermissions: true,
    },
  });
};

export const findRoleById = async (id: string) => {
  return await prisma.role.findUnique({
    where: { id },
    include: {
      users: true,
      systemPermissions: true,
    },
  });
};

export const createRole = async (name: string) => {
  return await prisma.role.create({
    data: { name },
    include: {
      users: true,
      systemPermissions: true,
    },
  });
};

export const updateRole = async (id: string, name: string) => {
  return await prisma.role.update({
    where: { id },
    data: { name },
    include: {
      users: true,
      systemPermissions: true,
    },
  });
};

export const deleteRoleById = async (id: string) => {
  return await prisma.role.delete({
    where: { id },
  });
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

export const getSystemPermissionForRole = async (roleId: string) => {
  return await prisma.systemPermission.findFirst({
    where: { roleId },
  });
};

export const setSystemPermissionForRole = async (
  roleId: string,
  permission: number
) => {
  const existing = await getSystemPermissionForRole(roleId);

  if (existing) {
    return await prisma.systemPermission.update({
      where: { id: existing.id },
      data: { permission },
    });
  } else {
    return await prisma.systemPermission.create({
      data: { roleId, permission },
    });
  }
};
