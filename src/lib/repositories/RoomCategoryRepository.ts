import { Room, RoomCategory } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export const findAllWithRooms = async (): Promise<
  (RoomCategory & { rooms: Room[] })[]
> => {
  return prisma.roomCategory.findMany({
    include: {
      rooms: {
        orderBy: { title: "asc" },
      },
    },
    orderBy: { label: "asc" },
  });
};

export const findByIdWithRooms = async (
  id: string
): Promise<(RoomCategory & { rooms: Room[] }) | null> => {
  return prisma.roomCategory.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: { title: "asc" },
      },
    },
  });
};

export const findBySlug = async (slug: string) => {
  return prisma.roomCategory.findUnique({ where: { slug } });
};

export const createCategory = async (label: string, slug: string) => {
  return prisma.roomCategory.create({ data: { label, slug } });
};

export const updateCategory = async (
  id: string,
  label: string,
  slug: string
) => {
  return prisma.roomCategory.update({
    where: { id },
    data: { label, slug },
  });
};

export const deleteCategoryAndRooms = async (
  id: string
): Promise<RoomCategory> => {
  const [, deletedCategory] = await prisma.$transaction([
    prisma.room.deleteMany({ where: { categoryId: id } }),
    prisma.roomCategory.delete({ where: { id } }),
  ]);

  return deletedCategory as RoomCategory;
};
