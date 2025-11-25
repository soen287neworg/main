import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  BitfieldSystemDefinitions,
  hasAnySystemPermission,
  hasSystemPermission,
} from "@/lib/types/roles";
import {
  getRequestHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server";

type PermissionCarrier = {
  systemPermissions?: { permission: number }[];
  roles?: { systemPermissions?: { permission: number }[] }[];
};

export type PermissionContext = {
  userId: string;
  permissionMask: number;
};

const buildPermissionMask = (entity: PermissionCarrier | null) => {
  if (!entity) return 0;

  let permissionMask = 0;

  entity.systemPermissions?.forEach((permission) => {
    permissionMask |= permission.permission;
  });

  entity.roles?.forEach((role) => {
    role.systemPermissions?.forEach((permission) => {
      permissionMask |= permission.permission;
    });
  });

  return permissionMask;
};

export const getUserPermissionContext = async (
  userId: string
): Promise<PermissionContext | null> => {
  const userWithPermissions = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      systemPermissions: true,
      roles: {
        include: { systemPermissions: true },
      },
    },
  });

  if (!userWithPermissions) return null;

  return {
    userId,
    permissionMask: buildPermissionMask(userWithPermissions),
  };
};

export const getCurrentUserPermissionContext = async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user?.id) return null;

  return getUserPermissionContext(session.user.id);
};

export const checkPermission = async (
  required: BitfieldSystemDefinitions
) => {
  const permissionContext = await getCurrentUserPermissionContext();

  if (!permissionContext) {
    return {
      hasSession: false,
      allowed: false,
      permissionMask: 0,
    };
  }

  return {
    hasSession: true,
    allowed: hasSystemPermission(
      permissionContext.permissionMask,
      required
    ),
    permissionMask: permissionContext.permissionMask,
  };
};

export const checkAnyPermission = async (
  permissions: BitfieldSystemDefinitions[]
) => {
  const permissionContext = await getCurrentUserPermissionContext();

  if (!permissionContext) {
    return {
      hasSession: false,
      allowed: false,
      permissionMask: 0,
    };
  }

  return {
    hasSession: true,
    allowed: hasAnySystemPermission(
      permissionContext.permissionMask,
      permissions
    ),
    permissionMask: permissionContext.permissionMask,
  };
};

export const assertPermission = async (
  required: BitfieldSystemDefinitions
) => {
  const result = await checkPermission(required);

  if (!result.hasSession) {
    setResponseStatus(401);
    throw new Error("User is not authenticated.");
  }

  if (!result.allowed) {
    setResponseStatus(403);
    throw new Error("User is not authorized to perform this action.");
  }

  return result;
};

export const assertAnyPermission = async (
  permissions: BitfieldSystemDefinitions[]
) => {
  const result = await checkAnyPermission(permissions);

  if (!result.hasSession) {
    setResponseStatus(401);
    throw new Error("User is not authenticated.");
  }

  if (!result.allowed) {
    setResponseStatus(403);
    throw new Error("User is not authorized to perform this action.");
  }

  return result;
};
