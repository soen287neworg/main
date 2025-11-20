import prisma from "@/lib/prisma";

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
