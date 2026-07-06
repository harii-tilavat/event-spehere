import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as categoryService from "@/services/category.service.js";
import { toCategoryDto } from "@/services/category.service.js";

export const list = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === "true" && req.user?.role === "super_admin";
  const categories = await categoryService.listCategories(includeInactive);
  ok(res, "Categories", { categories: categories.map(toCategoryDto) });
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  ok(res, "Category created", { category: toCategoryDto(category) }, { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(Number(req.params.id), req.body);
  ok(res, "Category updated", { category: toCategoryDto(category) });
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(Number(req.params.id));
  res.status(204).end();
});
