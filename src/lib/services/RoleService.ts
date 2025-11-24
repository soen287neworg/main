import { User } from "@/generated/prisma/client";
import {
  findRoleByName,
  connectRoleToUser,
  findAllRoles as findAllRolesInRepo,
  disconnectRoleFromUser as disconnectRoleFromUserInRepo,
} from "../repositories/RoleRepository";

export const findAllRoles = () => {
  return findAllRolesInRepo();
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
