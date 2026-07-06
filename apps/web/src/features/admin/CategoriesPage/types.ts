import type { CategoryCreateInput, CategoryDto } from "@eventsphere/shared";

export type CategoryFormValues = CategoryCreateInput;

export interface CategoryEditorState {
  isOpen: boolean;
  editing: CategoryDto | null;
}
