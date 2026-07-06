import { Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryDto } from "@eventsphere/shared";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  PageHeader,
  Textarea,
  type Column,
} from "@eventsphere/ui";
import { ImageUploader, QueryError } from "@/components";
import { categoryImage } from "@/lib/images";
import { useCategoriesPage } from "./useCategoriesPage";

export function CategoriesPage() {
  const {
    categories,
    isLoading,
    isError,
    error,
    refetch,
    form,
    errors,
    imageUrl,
    setImageUrl,
    isEditorOpen,
    setIsEditorOpen,
    editing,
    deleting,
    setDeleting,
    isSaving,
    isDeleting,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
  } = useCategoriesPage();

  const columns: Column<CategoryDto>[] = [
    {
      key: "name",
      header: "Category",
      render: (c) => (
        <div className="flex items-center gap-3">
          <img src={categoryImage(c.slug, c.imageUrl)} alt="" className="size-9 rounded-md border object-cover" />
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "hidden max-w-64 md:table-cell",
      render: (c) => <span className="line-clamp-2 text-muted-foreground">{c.description ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>),
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="Categories" description="Event categories shown to attendees while browsing" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Event categories shown to attendees while browsing"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={categories}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        emptyMessage="No categories yet — create the first one"
      />

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : "New category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField label="Name" htmlFor="cat-name" error={errors.name?.message}>
              <Input id="cat-name" {...form.register("name")} />
            </FormField>
            <FormField label="Description" htmlFor="cat-desc" error={errors.description?.message}>
              <Textarea id="cat-desc" rows={3} {...form.register("description")} />
            </FormField>
            <FormField label="Image" htmlFor="cat-image">
              <ImageUploader value={imageUrl} onChange={setImageUrl} folder="categories" />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" {...form.register("isActive")} />
              Active (visible to attendees)
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : editing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="Categories already used by events cannot be deleted. This cannot be undone."
        confirmLabel="Delete"
        destructive
        pending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
