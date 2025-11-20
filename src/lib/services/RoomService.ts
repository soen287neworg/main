import * as RoomRepository from "@/lib/repositories/RoomRepository";

export const getPublicRooms = async (categoryId?: string, search?: string) => {
  // Here you can add any business logic before or after fetching the data.
  // For example: logging, authorization checks, data transformation, etc.

  // 1. Call the repository to get the raw data
  const rooms = await RoomRepository.getPublicRooms(categoryId, search);

  // 2. (Optional) Apply any additional business logic
  // For instance, you might want to transform the data or combine it
  // with data from another source.
  // For now, we'll just return the data directly.

  return rooms;
};

export const getPublicRoomById = async (roomId: string) => {
  const room = await RoomRepository.getPublicRoom(roomId);

  return room;
};
