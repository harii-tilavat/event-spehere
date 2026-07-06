import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categoryCreateSchema, type CategoryDto } from "@eventsphere/shared";
import { useCreateCategory, useDeleteCategory, useGetCategories, useUpdateCategory } from "@/api";
import type { CategoryFormValues } from "./types";

export function useCategoriesPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [deleting, setDeleting] = useState<CategoryDto | null>(null);

  const categoriesQuery = useGetCategories({ includeInactive: true });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { isActive: true },
  });

  const createCategory = useCreateCategory({
    onSuccess: () => {
      toast.success("Category created");
      setIsEditorOpen(false);
    },
  });
  const updateCategory = useUpdateCategory({
    onSuccess: () => {
      toast.success("Category updated");
      setIsEditorOpen(false);
    },
  });
  const deleteCategory = useDeleteCategory({
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleting(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", description: "", imageUrl: null, isActive: true });
    setIsEditorOpen(true);
  };

  const openEdit = (category: CategoryDto) => {
    setEditing(category);
    form.reset({
      name: category.name,
      description: category.description ?? "",
      imageUrl: category.imageUrl,
      isActive: category.isActive,
    });
    setIsEditorOpen(true);
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (editing) updateCategory.mutate({ id: editing.id, data: values });
    else createCategory.mutate(values);
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isPending,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
    form,
    errors: form.formState.errors,
    imageUrl: form.watch("imageUrl") ?? null,
    setImageUrl: (url: string | null) => form.setValue("imageUrl", url),
    isEditorOpen,
    setIsEditorOpen,
    editing,
    deleting,
    setDeleting,
    isSaving: createCategory.isPending || updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete: () => deleting && deleteCategory.mutate(deleting.id),
  };
}
