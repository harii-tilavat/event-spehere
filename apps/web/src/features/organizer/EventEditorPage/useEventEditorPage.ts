import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { TicketTypeDto } from "@eventsphere/shared";
import {
  type EventPayload,
  useCreateEvent,
  useCreateTicketType,
  useDeleteTicketType,
  useGetCategories,
  useGetEvent,
  useGetVenues,
  useSubmitEvent,
  useUpdateEvent,
  useUpdateTicketType,
} from "@/api";
import { fromDatetimeLocal, toDatetimeLocal } from "@/lib/format";
import { eventFormSchema, ticketFormSchema, type EventFormValues, type TicketFormValues } from "./types";

export function useEventEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const eventQuery = useGetEvent(slug);
  const event = eventQuery.data;
  const categoriesQuery = useGetCategories();
  const venuesQuery = useGetVenues({ page: 1 });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { capacity: 100 },
  });

  // Hydrate the form when the event loads (edit mode)
  useEffect(() => {
    if (!event) return;
    form.reset({
      title: event.title,
      description: event.description,
      categoryId: String(event.category.id),
      venueId: String(event.venue.id),
      bannerUrl: event.bannerUrl,
      startTime: toDatetimeLocal(event.startTime),
      endTime: toDatetimeLocal(event.endTime),
      registrationDeadline: toDatetimeLocal(event.registrationDeadline),
      capacity: event.capacity,
    });
  }, [event, form]);

  const toPayload = (values: EventFormValues): EventPayload => ({
    title: values.title,
    description: values.description,
    categoryId: Number(values.categoryId),
    venueId: Number(values.venueId),
    bannerUrl: values.bannerUrl ?? null,
    galleryImages: event?.galleryImages ?? [],
    startTime: fromDatetimeLocal(values.startTime),
    endTime: fromDatetimeLocal(values.endTime),
    registrationDeadline: fromDatetimeLocal(values.registrationDeadline),
    capacity: values.capacity,
  });

  const createEvent = useCreateEvent({
    onSuccess: (created) => {
      toast.success("Draft created — now add ticket types");
      navigate(`/organizer/events/${created.slug}/edit`, { replace: true });
    },
  });
  const updateEvent = useUpdateEvent({
    onSuccess: () => toast.success("Event saved"),
  });
  const submitEvent = useSubmitEvent({
    onSuccess: () => {
      toast.success("Submitted for approval");
      navigate("/organizer/events");
    },
  });

  const handleSave = form.handleSubmit((values) => {
    if (isEdit && event) updateEvent.mutate({ id: event.id, data: toPayload(values) });
    else createEvent.mutate(toPayload(values));
  });

  // ----- Ticket types (edit mode) -----
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketTypeDto | null>(null);

  const ticketForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { priceRupees: 0, quantityTotal: 50, maxPerBooking: 10, isActive: true },
  });

  const createTicket = useCreateTicketType({
    onSuccess: () => {
      toast.success("Ticket type added");
      setTicketDialogOpen(false);
    },
  });
  const updateTicket = useUpdateTicketType({
    onSuccess: () => {
      toast.success("Ticket type updated");
      setTicketDialogOpen(false);
    },
  });
  const deleteTicket = useDeleteTicketType({
    onSuccess: () => toast.success("Ticket type deleted"),
  });

  const openAddTicket = () => {
    setEditingTicket(null);
    ticketForm.reset({ name: "", description: "", priceRupees: 0, quantityTotal: 50, maxPerBooking: 10, isActive: true });
    setTicketDialogOpen(true);
  };

  const openEditTicket = (ticket: TicketTypeDto) => {
    setEditingTicket(ticket);
    ticketForm.reset({
      name: ticket.name,
      description: ticket.description ?? "",
      priceRupees: ticket.pricePaise / 100,
      quantityTotal: ticket.quantityTotal,
      maxPerBooking: ticket.maxPerBooking,
      isActive: ticket.isActive,
    });
    setTicketDialogOpen(true);
  };

  const handleTicketSave = ticketForm.handleSubmit((values) => {
    if (!event) return;
    const data = {
      name: values.name,
      description: values.description || null,
      pricePaise: Math.round(values.priceRupees * 100),
      quantityTotal: values.quantityTotal,
      maxPerBooking: values.maxPerBooking,
      isActive: values.isActive,
    };
    if (editingTicket) updateTicket.mutate({ id: editingTicket.id, data });
    else createTicket.mutate({ eventId: event.id, data });
  });

  const isEditable = !isEdit || (event ? ["draft", "rejected"].includes(event.status) : false);

  return {
    isEdit,
    event,
    isLoadingEvent: isEdit && eventQuery.isPending,
    isEventError: isEdit && eventQuery.isError,
    eventError: eventQuery.error,
    refetchEvent: eventQuery.refetch,
    isEditable,
    categories: categoriesQuery.data ?? [],
    venues: venuesQuery.data?.rows ?? [],
    form,
    errors: form.formState.errors,
    bannerUrl: form.watch("bannerUrl") ?? null,
    setBannerUrl: (url: string | null) => form.setValue("bannerUrl", url),
    isSaving: createEvent.isPending || updateEvent.isPending,
    isSubmittingApproval: submitEvent.isPending,
    handleSave,
    handleSubmitForApproval: () => event && submitEvent.mutate(event.id),
    // ticket section
    ticketTypes: event?.ticketTypes ?? [],
    ticketDialogOpen,
    setTicketDialogOpen,
    editingTicket,
    ticketForm,
    ticketErrors: ticketForm.formState.errors,
    isSavingTicket: createTicket.isPending || updateTicket.isPending,
    isDeletingTicket: deleteTicket.isPending,
    openAddTicket,
    openEditTicket,
    handleTicketSave,
    handleTicketDelete: (id: number) => deleteTicket.mutate(id),
  };
}
