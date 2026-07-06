import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { VenueCreateInput, VenueDto } from "@eventsphere/shared";
import { useCreateVenue, useDeleteVenue, useGetVenues, useUpdateVenue } from "@/api";
import { useDebounce } from "@/hooks/useDebounce";
import { venueFormSchema, type VenueFormValues } from "./types";

function toPayload(values: VenueFormValues): VenueCreateInput {
  const { facilitiesText, ...rest } = values;
  return {
    ...rest,
    facilities: facilitiesText
      ? facilitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [],
    images: [],
  };
}

export function useVenuesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editing, setEditing] = useState<VenueDto | null>(null);
  const [deleting, setDeleting] = useState<VenueDto | null>(null);

  const venuesQuery = useGetVenues({ page, search: debouncedSearch || undefined });

  const form = useForm<VenueFormValues>({ resolver: zodResolver(venueFormSchema) });

  const createVenue = useCreateVenue({
    onSuccess: () => {
      toast.success("Venue created");
      setIsEditorOpen(false);
    },
  });
  const updateVenue = useUpdateVenue({
    onSuccess: () => {
      toast.success("Venue updated");
      setIsEditorOpen(false);
    },
  });
  const deleteVenue = useDeleteVenue({
    onSuccess: () => {
      toast.success("Venue deleted");
      setDeleting(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", addressLine: "", city: "", state: "", pincode: "", capacity: 100, facilitiesText: "" });
    setIsEditorOpen(true);
  };

  const openEdit = (venue: VenueDto) => {
    setEditing(venue);
    form.reset({
      name: venue.name,
      addressLine: venue.addressLine,
      city: venue.city,
      state: venue.state,
      pincode: venue.pincode ?? "",
      capacity: venue.capacity,
      latitude: venue.latitude,
      longitude: venue.longitude,
      facilitiesText: venue.facilities.join(", "),
    });
    setIsEditorOpen(true);
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (editing) updateVenue.mutate({ id: editing.id, data: toPayload(values) });
    else createVenue.mutate(toPayload(values));
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    venues: venuesQuery.data?.rows ?? [],
    meta: venuesQuery.data?.meta,
    isLoading: venuesQuery.isPending,
    isError: venuesQuery.isError,
    error: venuesQuery.error,
    refetch: venuesQuery.refetch,
    search,
    handleSearchChange,
    setPage,
    form,
    errors: form.formState.errors,
    isEditorOpen,
    setIsEditorOpen,
    editing,
    deleting,
    setDeleting,
    isSaving: createVenue.isPending || updateVenue.isPending,
    isDeleting: deleteVenue.isPending,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete: () => deleting && deleteVenue.mutate(deleting.id),
  };
}
