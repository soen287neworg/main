import * as ScheduleRepository from "@/lib/repositories/ScheduleRepository";

export const getActiveScheduleForRoom = async (
  roomId: string,
  targetDate: Date
) => {
  return ScheduleRepository.getActiveScheduleForRoom(roomId, targetDate);
};
