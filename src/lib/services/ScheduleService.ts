import {
  Blackout,
  OperatingHours,
  Schedule,
} from "@/generated/prisma/client";
import * as ScheduleRepository from "@/lib/repositories/ScheduleRepository";

export type ScheduleWithDetails = Schedule & {
  operatingHours: OperatingHours[];
  blackouts: Blackout[];
};

export type ScheduleWriteInput = {
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

export const listSchedulesForRoom = async (roomId: string) => {
  return ScheduleRepository.listSchedulesForRoom(roomId);
};

export const createScheduleForRoom = async (
  roomId: string,
  data: ScheduleWriteInput
): Promise<ScheduleWithDetails> => {
  return ScheduleRepository.createScheduleForRoom(roomId, data);
};

export const updateScheduleForRoom = async (
  scheduleId: string,
  roomId: string,
  data: ScheduleWriteInput
): Promise<ScheduleWithDetails> => {
  return ScheduleRepository.updateScheduleForRoom(scheduleId, roomId, data);
};

export const addBlackoutToSchedule = async (
  scheduleId: string,
  data: { startTime: Date; endTime: Date; reason?: string | null }
): Promise<Blackout> => {
  return ScheduleRepository.addBlackoutToSchedule(scheduleId, data);
};

export const updateBlackout = async (
  blackoutId: string,
  data: { startTime: Date; endTime: Date; reason?: string | null }
): Promise<Blackout> => {
  return ScheduleRepository.updateBlackout(blackoutId, data);
};

export const deleteBlackout = async (blackoutId: string) => {
  return ScheduleRepository.deleteBlackout(blackoutId);
};

export const getActiveScheduleForRoom = async (
  roomId: string,
  targetDate: Date
) => {
  return ScheduleRepository.getActiveScheduleForRoom(roomId, targetDate);
};
