import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@eventsphere/ui";
import { ImageUploader, QueryError } from "@/components";
import { EventStatusBadge } from "@/components/EventStatusBadge/EventStatusBadge";
import { formatINR } from "@/lib/format";
import { useEventEditorPage } from "./useEventEditorPage";

export function EventEditorPage() {
  const {
    isEdit,
    event,
    isLoadingEvent,
    isEventError,
    eventError,
    refetchEvent,
    isEditable,
    categories,
    venues,
    form,
    errors,
    bannerUrl,
    setBannerUrl,
    isSaving,
    isSubmittingApproval,
    handleSave,
    handleSubmitForApproval,
    ticketTypes,
    ticketDialogOpen,
    setTicketDialogOpen,
    editingTicket,
    ticketForm,
    ticketErrors,
    isSavingTicket,
    isDeletingTicket,
    openAddTicket,
    openEditTicket,
    handleTicketSave,
    handleTicketDelete,
  } = useEventEditorPage();

  if (isLoadingEvent) {
    return <div className="h-96 animate-pulse rounded-2xl border bg-card" />;
  }
  if (isEventError) {
    return <QueryError error={eventError} onRetry={refetchEvent} />;
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? `Edit: ${event?.title ?? ""}` : "Create event"}
        description={
          isEdit ? "Update details, manage ticket types, then submit for approval" : "Create a draft first — ticket types come next"
        }
        actions={event ? <EventStatusBadge status={event.status} /> : undefined}
      />

      {event?.status === "rejected" && event.rejectionReason && (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="p-4 text-sm">
            <Badge variant="destructive" className="mr-2">
              Rejected
            </Badge>
            {event.rejectionReason}
          </CardContent>
        </Card>
      )}

      {!isEditable && (
        <Card className="mb-6">
          <CardContent className="p-4 text-sm text-muted-foreground">
            This event is {event?.status.replace("_", " ")} — details can only be edited while draft or rejected.
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSave} className="space-y-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Title" htmlFor="e-title" error={errors.title?.message}>
              <Input id="e-title" disabled={!isEditable} {...form.register("title")} />
            </FormField>
            <FormField label="Description" htmlFor="e-desc" error={errors.description?.message}>
              <Textarea id="e-desc" rows={6} disabled={!isEditable} {...form.register("description")} />
            </FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Category" htmlFor="e-category" error={errors.categoryId?.message}>
                <Select
                  value={form.watch("categoryId") ?? ""}
                  onValueChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })}
                  disabled={!isEditable}
                >
                  <SelectTrigger id="e-category">
                    <SelectValue placeholder="Pick a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Venue" htmlFor="e-venue" error={errors.venueId?.message}>
                <Select
                  value={form.watch("venueId") ?? ""}
                  onValueChange={(v) => form.setValue("venueId", v, { shouldValidate: true })}
                  disabled={!isEditable}
                >
                  <SelectTrigger id="e-venue">
                    <SelectValue placeholder="Pick a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.name} — {v.city} (cap {v.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="Banner" htmlFor="e-banner">
              <ImageUploader value={bannerUrl} onChange={setBannerUrl} folder="events" label="Upload banner" />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule & capacity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <FormField label="Starts" htmlFor="e-start" error={errors.startTime?.message}>
              <Input id="e-start" type="datetime-local" disabled={!isEditable} {...form.register("startTime")} />
            </FormField>
            <FormField label="Ends" htmlFor="e-end" error={errors.endTime?.message}>
              <Input id="e-end" type="datetime-local" disabled={!isEditable} {...form.register("endTime")} />
            </FormField>
            <FormField
              label="Registration deadline"
              htmlFor="e-deadline"
              error={errors.registrationDeadline?.message}
            >
              <Input id="e-deadline" type="datetime-local" disabled={!isEditable} {...form.register("registrationDeadline")} />
            </FormField>
            <FormField label="Capacity" htmlFor="e-capacity" error={errors.capacity?.message}>
              <Input id="e-capacity" type="number" min={1} disabled={!isEditable} {...form.register("capacity")} />
            </FormField>
          </CardContent>
        </Card>

        {isEditable && (
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create draft"}
            </Button>
            {isEdit && (
              <Button type="button" variant="secondary" disabled={isSubmittingApproval} onClick={handleSubmitForApproval}>
                <Send className="size-4" /> {isSubmittingApproval ? "Submitting…" : "Submit for approval"}
              </Button>
            )}
          </div>
        )}
      </form>

      {isEdit && (
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Ticket types</CardTitle>
            {isEditable && (
              <Button size="sm" onClick={openAddTicket}>
                <Plus className="size-4" /> Add ticket type
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {ticketTypes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No ticket types yet — at least one active type is required before submitting for approval.
              </p>
            )}
            {ticketTypes.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">
                    {t.name}{" "}
                    {!t.isActive && (
                      <Badge variant="secondary" className="ml-1">
                        Inactive
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.pricePaise === 0 ? "Free" : formatINR(t.pricePaise)} · {t.quantitySold}/{t.quantityTotal} sold · max{" "}
                    {t.maxPerBooking}/booking
                  </p>
                </div>
                {isEditable && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditTicket(t)} aria-label={`Edit ${t.name}`}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeletingTicket || t.quantitySold > 0}
                      onClick={() => handleTicketDelete(t.id)}
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTicket ? `Edit ${editingTicket.name}` : "Add ticket type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTicketSave} className="space-y-4" noValidate>
            <FormField label="Name" htmlFor="t-name" error={ticketErrors.name?.message}>
              <Input id="t-name" placeholder="General, VIP…" {...ticketForm.register("name")} />
            </FormField>
            <FormField label="Description" htmlFor="t-desc" error={ticketErrors.description?.message}>
              <Input id="t-desc" {...ticketForm.register("description")} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price (₹)" htmlFor="t-price" error={ticketErrors.priceRupees?.message} hint="0 = free">
                <Input id="t-price" type="number" min={0} step="0.01" {...ticketForm.register("priceRupees")} />
              </FormField>
              <FormField label="Quantity" htmlFor="t-qty" error={ticketErrors.quantityTotal?.message}>
                <Input id="t-qty" type="number" min={1} {...ticketForm.register("quantityTotal")} />
              </FormField>
            </div>
            <FormField label="Max per booking" htmlFor="t-max" error={ticketErrors.maxPerBooking?.message}>
              <Input id="t-max" type="number" min={1} max={50} {...ticketForm.register("maxPerBooking")} />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" {...ticketForm.register("isActive")} />
              Active (on sale)
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTicketDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingTicket}>
                {isSavingTicket ? "Saving…" : editingTicket ? "Save changes" : "Add ticket type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
