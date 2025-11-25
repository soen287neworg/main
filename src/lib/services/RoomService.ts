import * as RoomRepository from "@/lib/repositories/RoomRepository";
import { RoomWithSchedules } from "@/lib/repositories/RoomRepository";
import { RoomCreateInput, RoomUpdateInput } from "@/generated/prisma/models";
import { Room, RoomCategory } from "@/generated/prisma/client";

export const getPublicRooms = async (
  categoryId?: string | null,
  search?: string
) => {
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

export const getRoomsWithSchedules = async (
  search?: string
): Promise<RoomWithSchedules[]> => {
  return RoomRepository.getRoomsWithSchedules(search);
};

// Admin methods with specific input types
export const getAllRooms = async () => {
  const rooms = await RoomRepository.getAllRooms();
  return rooms;
};

export const getRoomById = async (roomId: string) => {
  const room = await RoomRepository.getRoomById(roomId);
  return room;
};

export const createRoom = async (roomData: {
  number: string;
  title: string;
  description: string;
  level: string;
  capacity: number;
  note?: string | null;
  categoryId?: string | null;
  active?: boolean;
  imageUrl?: string;
}) => {
  const room = await RoomRepository.createRoom(roomData);
  return room;
};

export const updateRoom = async (
  roomId: string,
  roomData: {
    number?: string;
    title?: string;
    description?: string;
    level?: string;
    capacity?: number;
    note?: string | null;
    categoryId?: string | null;
    active?: boolean;
    imageUrl?: string;
  }
) => {
  const room = await RoomRepository.updateRoom(roomId, roomData);
  return room;
};

export const deleteRoom = async (roomId: string) => {
  const room = await RoomRepository.deleteRoom(roomId);
  return room;
};

export const getRoomWithDetails = async (roomId: string) => {
  const room = await RoomRepository.getRoomWithDetails(roomId);
  return room;
};

// Image upload method
export const updateRoomImage = async (roomId: string, imageUrl: string) => {
  const room = await RoomRepository.updateRoom(roomId, { imageUrl });
  return room;
};
