import { auth } from "../auth";
import { User as BetterAuthUser } from "better-auth";
import { assignDefaultRoleToUser } from "./RoleService";
import { GenericRoles } from "../types/roles";

import { User } from "@/generated/prisma/client";

/**
 * Creates the user with betterAuth, assigns roles and permissions
 *
 *
 * @param firstName
 * @param lastName
 * @param email
 * @param password unencrypted password
 * @returns A User object as defined per Prisma schema
 *
 *
 */
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<User> =>
  auth.api
    .signUpEmail({
      body: {
        name: `${firstName} ${lastName}`,
        email,
        password,
      },
    })
    .then((data) => {
      const user: BetterAuthUser = data.user;

      return assignDefaultRoleToUser(user.id, GenericRoles.STUDENT);
    });

export const loginUser = async (
  email: string,
  password: string
): Promise<BetterAuthUser> =>
  auth.api
    .signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
    })
    .then((data) => data.user);
