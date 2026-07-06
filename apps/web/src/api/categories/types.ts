import type { ApiSuccess, CategoryCreateInput, CategoryDto, CategoryUpdateInput } from "@eventsphere/shared";

export type { CategoryCreateInput, CategoryDto, CategoryUpdateInput };

export interface GetCategoriesParams {
  includeInactive?: boolean;
}

export type CategoriesResponse = ApiSuccess<{ categories: CategoryDto[] }>;
export type CategoryResponse = ApiSuccess<{ category: CategoryDto }>;

export interface UpdateCategoryVariables {
  id: number;
  data: CategoryUpdateInput;
}
