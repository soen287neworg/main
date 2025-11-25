import { User } from "@/generated/prisma/client";
import {
  findRoleByName,
  connectRoleToUser,
  findAllRoles as findAllRolesInRepo,
  disconnectRoleFromUser as disconnectRoleFromUserInRepo,
  findRoleById,
  createRole as createRoleInRepo,
  updateRole as updateRoleInRepo,
  deleteRoleById,
  getSystemPermissionForRole,
  setSystemPermissionForRole,
} from "../repositories/RoleRepository";

export const findAllRoles = () => {
  return findAllRolesInRepo();
};

export const findRoleByIdService = (id: string) => {
  return findRoleById(id);
};

export const createRole = async (name: string) => {
  return createRoleInRepo(name);
};

export const updateRole = async (id: string, name: string) => {
  return updateRoleInRepo(id, name);
};

export const deleteRole = async (id: string) => {
  return deleteRoleById(id);
};

export const getSystemPermission = async (roleId: string) => {
  return getSystemPermissionForRole(roleId);
};

export const setSystemPermission = async (
  roleId: string,
  permission: number
) => {
  return setSystemPermissionForRole(roleId, permission);
};

/**
 * Assigns the default role to a user.
 * @param userId - The ID of the user to assign the role to.
 * @param roleName - Name of the system role
 * @throws An error if the default role is not found.
 */
export const assignDefaultRoleToUser = async (
  userId: string,
  roleName: string
): Promise<User> =>
  findRoleByName(roleName).then((role) => {
    if (!role) {
      throw new Error(`Role "${roleName}" not found.`);
    }

    return connectRoleToUser(userId, role.id);
  });

export const addRoleToUser = async (userId: string, roleId: string) => {
  return connectRoleToUser(userId, roleId);
};

export const removeRoleFromUser = async (userId: string, roleId: string) => {
  return disconnectRoleFromUserInRepo(userId, roleId);
};
