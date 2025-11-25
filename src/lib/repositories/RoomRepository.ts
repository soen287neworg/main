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

export const getPublicRooms = async (
  categoryId?: string | null,
  search?: string
) => {
  return prisma.room.findMany({
    where: {
      active: true,
      categoryId:
        categoryId === null ? null : categoryId ? categoryId : undefined,
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
        orderBy: [{ priority: "desc" }, { activeFrom: "desc" }],
      },
    },
    orderBy: { title: "asc" },
  });
};

// Admin methods
export const getAllRooms = async () => {
  return prisma.room.findMany({
    include: {
      category: true,
    },
  });
};

export const getRoomById = async (roomId: string) => {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      category: true,
    },
  });
};

export const createRoom = async (roomData: any) => {
  return prisma.room.create({
    data: roomData,
  });
};

export const updateRoom = async (roomId: string, roomData: any) => {
  return prisma.room.update({
    where: { id: roomId },
    data: roomData,
  });
};

export const deleteRoom = async (roomId: string) => {
  return prisma.room.delete({
    where: { id: roomId },
  });
};

export const getRoomWithDetails = async (roomId: string) => {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      category: true,
      bookings: {
        include: {
          user: true,
        },
      },
      schedules: {
        include: {
          operatingHours: true,
          blackouts: true,
        },
      },
    },
  });
};
