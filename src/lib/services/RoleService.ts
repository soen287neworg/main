import { User } from "@/generated/prisma/client";
import {
  findRoleByName,
  connectRoleToUser,
} from "../repositories/RoleRepository";

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
