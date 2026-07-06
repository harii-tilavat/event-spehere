import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { VenueDto } from "@eventsphere/shared";
import {
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
  type Column,
} from "@eventsphere/ui";
import { QueryError } from "@/components";
import { useVenuesPage } from "./useVenuesPage";

export function VenuesPage() {
  const {
    venues,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    search,
    handleSearchChange,
    setPage,
    form,
    errors,
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
  } = useVenuesPage();

  const columns: Column<VenueDto>[] = [
    {
      key: "name",
      header: "Venue",
      render: (v) => (
        <div>
          <p className="font-medium">{v.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {v.city}, {v.state}
          </p>
        </div>
      ),
    },
    { key: "capacity", header: "Capacity", render: (v) => v.capacity.toLocaleString() },
    {
      key: "facilities",
      header: "Facilities",
      className: "hidden max-w-56 lg:table-cell",
      render: (v) => <span className="line-clamp-1 text-muted-foreground">{v.facilities.join(", ") || "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      render: (v) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label={`Edit ${v.name}`}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(v)} aria-label={`Delete ${v.name}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div>
        <PageHeader title="Venues" description="Physical locations where events are hosted" />
        <QueryError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Venues"
        description="Physical locations where events are hosted"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New venue
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Input placeholder="Search venues…" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
      </div>

      <DataTable
        columns={columns}
        rows={venues}
        rowKey={(v) => v.id}
        isLoading={isLoading}
        emptyMessage="No venues found"
        meta={meta}
        onPageChange={setPage}
      />

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : "New venue"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField label="Name" htmlFor="v-name" error={errors.name?.message}>
              <Input id="v-name" {...form.register("name")} />
            </FormField>
            <FormField label="Address" htmlFor="v-address" error={errors.addressLine?.message}>
              <Input id="v-address" {...form.register("addressLine")} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" htmlFor="v-city" error={errors.city?.message}>
                <Input id="v-city" {...form.register("city")} />
              </FormField>
              <FormField label="State" htmlFor="v-state" error={errors.state?.message}>
                <Input id="v-state" {...form.register("state")} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Pincode" htmlFor="v-pincode" error={errors.pincode?.message}>
                <Input id="v-pincode" inputMode="numeric" {...form.register("pincode")} />
              </FormField>
              <FormField label="Capacity" htmlFor="v-capacity" error={errors.capacity?.message}>
                <Input id="v-capacity" type="number" min={1} {...form.register("capacity")} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Latitude" htmlFor="v-lat" error={errors.latitude?.message} hint="Optional">
                <Input id="v-lat" type="number" step="any" {...form.register("latitude")} />
              </FormField>
              <FormField label="Longitude" htmlFor="v-lng" error={errors.longitude?.message} hint="Optional">
                <Input id="v-lng" type="number" step="any" {...form.register("longitude")} />
              </FormField>
            </div>
            <FormField
              label="Facilities"
              htmlFor="v-facilities"
              error={errors.facilitiesText?.message}
              hint="Comma separated, e.g. Parking, WiFi, Food court"
            >
              <Input id="v-facilities" {...form.register("facilitiesText")} />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : editing ? "Save changes" : "Create venue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="Venues with upcoming published events cannot be deleted."
        confirmLabel="Delete"
        destructive
        pending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
