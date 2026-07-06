import { Op, type WhereOptions } from "sequelize";
import type { CategoryCreateInput, CategoryDto, CategoryUpdateInput } from "@eventsphere/shared";
import { Category } from "@/models/index.js";
import { AppError } from "@/utils/app-error.js";
import { slugify } from "@/utils/slug.js";

export function toCategoryDto(c: Category): CategoryDto {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function listCategories(includeInactive: boolean): Promise<Category[]> {
  const where: WhereOptions = includeInactive ? {} : { isActive: true };
  return Category.findAll({ where, order: [["name", "ASC"]] });
}

export async function createCategory(input: CategoryCreateInput): Promise<Category> {
  const existing = await Category.findOne({ where: { name: input.name } });
  if (existing) throw new AppError(409, "CONFLICT", "A category with this name already exists");
  return Category.create({
    name: input.name,
    slug: slugify(input.name),
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    isActive: input.isActive,
  });
}

export async function updateCategory(id: number, input: CategoryUpdateInput): Promise<Category> {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError(404, "NOT_FOUND", "Category not found");

  if (input.name && input.name !== category.name) {
    const dupe = await Category.findOne({ where: { name: input.name, id: { [Op.ne]: id } } });
    if (dupe) throw new AppError(409, "CONFLICT", "A category with this name already exists");
  }

  return category.update({
    ...(input.name !== undefined ? { name: input.name, slug: slugify(input.name) } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError(404, "NOT_FOUND", "Category not found");

  // RESTRICT once events exist (docs/04 §5); resolved via the registry so this
  // module has no compile-time dependency on the events module
  const EventModel = Category.sequelize?.models.Event;
  if (EventModel) {
    const count = await EventModel.count({ where: { categoryId: id } });
    if (count > 0) throw new AppError(409, "CONFLICT", "Category is in use by events and cannot be deleted");
  }
  await category.destroy();
}
