import { Room, RoomCategory } from "@/generated/prisma/client";
import * as RoomCategoryRepository from "@/lib/repositories/RoomCategoryRepository";

export type CategoryWithRooms = RoomCategory & { rooms: Room[] };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "category";

const ensureUniqueSlug = async (slug: string, ignoreId?: string) => {
  let uniqueSlug = slug;
  for (let suffix = 1; ; suffix++) {
    const existing = await RoomCategoryRepository.findBySlug(uniqueSlug);
    if (!existing || existing.id === ignoreId) {
      return uniqueSlug;
    }
    uniqueSlug = `${slug}-${suffix}`;
  }
};

export const listCategoriesWithRooms = async () => {
  return RoomCategoryRepository.findAllWithRooms();
};

export const createCategory = async (label: string) => {
  const baseSlug = slugify(label);
  const slug = await ensureUniqueSlug(baseSlug);
  const created = await RoomCategoryRepository.createCategory(label, slug);

  return RoomCategoryRepository.findByIdWithRooms(created.id);
};

export const updateCategory = async (id: string, label: string) => {
  const baseSlug = slugify(label);
  const slug = await ensureUniqueSlug(baseSlug, id);
  await RoomCategoryRepository.updateCategory(id, label, slug);

  return RoomCategoryRepository.findByIdWithRooms(id);
};

export const deleteCategoryAndRooms = async (id: string) => {
  return RoomCategoryRepository.deleteCategoryAndRooms(id);
};
