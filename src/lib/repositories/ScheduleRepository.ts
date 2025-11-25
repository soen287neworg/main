import { Blackout, OperatingHours, Schedule } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

type ScheduleWriteInput = {
  name: string;
  priority: number;
  activeFrom: Date;
  expiresAt?: Date | null;
  isActive: boolean;
  operatingHours: Pick<
    OperatingHours,
    "dayOfWeek" | "openingTime" | "closingTime" | "slotDuration"
  >[];
};

const scheduleInclude = {
  operatingHours: {
    orderBy: { dayOfWeek: "asc" } as const,
  },
  blackouts: {
    orderBy: { startTime: "desc" } as const,
  },
};

export const listSchedulesForRoom = async (
  roomId: string
): Promise<(Schedule & { operatingHours: OperatingHours[]; blackouts: Blackout[] })[]> => {
  return prisma.schedule.findMany({
    where: { roomId },
    include: scheduleInclude,
    orderBy: [
      { priority: "desc" },
      { activeFrom: "desc" },
    ],
  });
};

export const createScheduleForRoom = async (
  roomId: string,
  data: ScheduleWriteInput
): Promise<Schedule & { operatingHours: OperatingHours[]; blackouts: Blackout[] }> => {
  return prisma.schedule.create({
    data: {
      roomId,
      name: data.name,
      priority: data.priority,
      activeFrom: data.activeFrom,
      expiresAt: data.expiresAt ?? null,
      isActive: data.isActive,
      operatingHours: {
        create: data.operatingHours.map((oh) => ({
          dayOfWeek: oh.dayOfWeek,
          openingTime: oh.openingTime,
          closingTime: oh.closingTime,
          slotDuration: oh.slotDuration,
        })),
      },
    },
    include: scheduleInclude,
  });
};

export const updateScheduleForRoom = async (
  scheduleId: string,
  roomId: string,
  data: ScheduleWriteInput
): Promise<Schedule & { operatingHours: OperatingHours[]; blackouts: Blackout[] }> => {
  return prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      roomId,
      name: data.name,
      priority: data.priority,
      activeFrom: data.activeFrom,
      expiresAt: data.expiresAt ?? null,
      isActive: data.isActive,
      operatingHours: {
        deleteMany: { scheduleId },
        create: data.operatingHours.map((oh) => ({
          dayOfWeek: oh.dayOfWeek,
          openingTime: oh.openingTime,
          closingTime: oh.closingTime,
          slotDuration: oh.slotDuration,
        })),
      },
    },
    include: scheduleInclude,
  });
};

export const addBlackoutToSchedule = async (
  scheduleId: string,
  data: { startTime: Date; endTime: Date; reason?: string | null }
): Promise<Blackout> => {
  return prisma.blackout.create({
    data: {
      scheduleId,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason ?? null,
    },
  });
};

export const getActiveScheduleForRoom = async (
  roomId: string,
  targetDate: Date
) => {
  const schedule = await prisma.schedule.findFirst({
    where: {
      roomId,
      isActive: true,
      activeFrom: {
        lte: targetDate,
      },
      OR: [
        {
          expiresAt: {
            gte: targetDate,
          },
        },
        {
          expiresAt: null,
        },
      ],
    },
    orderBy: {
      priority: "desc",
    },
    include: {
      operatingHours: true,
      blackouts: {
        where: {
          startTime: {
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Less than end of day
          },
          endTime: {
            gt: targetDate, // Greater than start of day
          },
        },
      },
    },
  });

  return schedule;
};
