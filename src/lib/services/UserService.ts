import { UserCreateInput, UserUpdateInput } from "@/generated/prisma/models";
import {
  createUser as createUserInRepo,
  findUserByEmail as findUserByEmailInRepo,
  findUserById as findUserByIdInRepo,
  updateUser as updateUserInRepo,
  findAllUsers as findAllUsersInRepo,
  deleteUser as deleteUserInRepo,
} from "@/lib/repositories/UserRepository";

export const findUserById = (userId: string) => {
  return findUserByIdInRepo(userId);
};

export const findUserByEmail = (email: string) => {
  return findUserByEmailInRepo(email);
};

export const findAllUsers = () => {
  return findAllUsersInRepo();
};

export const createUser = (data: UserCreateInput) => {
  return createUserInRepo(data);
};

export const updateUser = (userId: string, data: UserUpdateInput) => {
  return updateUserInRepo(userId, data);
};

export const deleteUser = (userId: string) => {
  return deleteUserInRepo(userId);
};
