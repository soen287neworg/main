import {
  Blackout,
  OperatingHours,
  Room,
  Schedule,
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export type RoomWithSchedules = Room & {
  schedules: (Schedule & {
    operatingHours: OperatingHours[];
    blackouts: Blackout[];
  })[];
};

export const getPublicRooms = async (categoryId?: string, search?: string) => {
  return prisma.room.findMany({
    where: {
      active: true,
      categoryId: categoryId || undefined,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { note: { contains: search, mode: "insensitive" } },
            { number: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
  });
};

export const getPublicRoom = async (roomId: string) => {
  return prisma.room.findUniqueOrThrow({ where: { id: roomId } });
};

export const getRoomsWithSchedules = async (
  search?: string
): Promise<RoomWithSchedules[]> => {
  return prisma.room.findMany({
    where: {
      active: true,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { note: { contains: search, mode: "insensitive" } },
            { number: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      schedules: {
        include: {
          operatingHours: {
            orderBy: { dayOfWeek: "asc" },
          },
          blackouts: {
            orderBy: { startTime: "desc" },
          },
        },
        orderBy: [
          { priority: "desc" },
          { activeFrom: "desc" },
        ],
      },
    },
    orderBy: { title: "asc" },
  });
};
