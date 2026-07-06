import { Op, type WhereOptions } from "sequelize";
import type {
  EventCreateInput,
  EventDetailDto,
  EventListItemDto,
  EventListQuery,
  EventStatus,
  EventStatusFilterQuery,
  EventUpdateInput,
  Meta,
  OrganizerEventDto,
  TicketTypeDto,
} from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";
import { uniqueSlug } from "@/utils/slug.js";
import { Category, Event, EventImage, OrganizerProfile, TicketType, User, Venue } from "@/models/index.js";
import { toCategoryDto } from "@/services/category.service.js";
import { toVenueDto } from "@/services/venue.service.js";
import { sendEmailAsync } from "@/services/email.service.js";
import { eventDecisionEmail } from "@/emails/templates.js";

const EDITABLE_STATUSES: EventStatus[] = ["draft", "rejected"];

export function toTicketTypeDto(t: TicketType): TicketTypeDto {
  const now = new Date();
  const remaining = Math.max(0, t.quantityTotal - t.quantitySold);
  const windowOpen = (!t.saleStart || t.saleStart <= now) && (!t.saleEnd || t.saleEnd > now);
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    pricePaise: t.pricePaise,
    quantityTotal: t.quantityTotal,
    quantitySold: t.quantitySold,
    remaining,
    maxPerBooking: t.maxPerBooking,
    saleStart: t.saleStart?.toISOString() ?? null,
    saleEnd: t.saleEnd?.toISOString() ?? null,
    isActive: t.isActive,
    isOnSale: t.isActive && windowOpen && remaining > 0,
  };
}

function minActivePrice(ticketTypes: TicketType[] | undefined): number | null {
  const prices = (ticketTypes ?? []).filter((t) => t.isActive).map((t) => t.pricePaise);
  return prices.length ? Math.min(...prices) : null;
}

export function toEventListItemDto(e: Event): EventListItemDto {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    bannerUrl: e.bannerUrl,
    status: e.status,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime.toISOString(),
    registrationDeadline: e.registrationDeadline.toISOString(),
    capacity: e.capacity,
    isFeatured: e.isFeatured,
    city: e.venue?.city ?? "",
    venueName: e.venue?.name ?? "",
    categoryName: e.category?.name ?? "",
    minPricePaise: minActivePrice(e.ticketTypes),
  };
}

export function toOrganizerEventDto(e: Event): OrganizerEventDto {
  return {
    ...toEventListItemDto(e),
    rejectionReason: e.rejectionReason,
    ticketTypesCount: e.ticketTypes?.length ?? 0,
    ticketsSold: (e.ticketTypes ?? []).reduce((sum, t) => sum + t.quantitySold, 0),
  };
}

export async function toEventDetailDto(e: Event): Promise<EventDetailDto> {
  const organizerProfile = await OrganizerProfile.findOne({ where: { userId: e.organizerId } });
  return {
    ...toEventListItemDto(e),
    description: e.description,
    galleryImages: (e.images ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.imageUrl),
    venue: toVenueDto(e.venue as Venue),
    category: toCategoryDto(e.category as Category),
    organizer: {
      id: e.organizerId,
      organizationName: organizerProfile?.organizationName ?? "EventSphere organizer",
      logoUrl: organizerProfile?.logoUrl ?? null,
    },
    ticketTypes: (e.ticketTypes ?? []).map(toTicketTypeDto),
    rejectionReason: e.rejectionReason,
  };
}

const fullInclude = [
  { model: Venue, as: "venue" },
  { model: Category, as: "category" },
  { model: TicketType, as: "ticketTypes" },
  { model: EventImage, as: "images" },
];

// ---------- Public catalog ----------

export async function listPublished(query: EventListQuery): Promise<{ rows: Event[]; meta: Meta }> {
  const where: WhereOptions = {
    status: "published",
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
    ...(query.search
      ? { [Op.or]: [{ title: { [Op.like]: `%${query.search}%` } }, { description: { [Op.like]: `%${query.search}%` } }] }
      : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          startTime: {
            ...(query.dateFrom ? { [Op.gte]: query.dateFrom } : {}),
            ...(query.dateTo ? { [Op.lte]: query.dateTo } : {}),
          },
        }
      : {}),
  };

  const sortField = query.sortBy === "createdAt" ? "createdAt" : "startTime";
  const { rows, count } = await Event.findAndCountAll({
    where,
    include: [
      { model: Venue, as: "venue", ...(query.city ? { where: { city: query.city } } : {}) },
      { model: Category, as: "category" },
      { model: TicketType, as: "ticketTypes" },
    ],
    order: [
      ["isFeatured", "DESC"],
      [sortField, query.sortOrder === "desc" ? "DESC" : "ASC"],
    ],
    distinct: true,
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

export async function getBySlug(slug: string, viewer?: { id: number; role: string }): Promise<Event> {
  const event = await Event.findOne({ where: { slug }, include: fullInclude });
  if (!event) throw new AppError(404, "NOT_FOUND", "Event not found");

  const isOwner = viewer && event.organizerId === viewer.id;
  const isAdmin = viewer?.role === "super_admin";
  if (event.status !== "published" && event.status !== "completed" && event.status !== "cancelled" && !isOwner && !isAdmin) {
    throw new AppError(404, "NOT_FOUND", "Event not found");
  }
  return event;
}

// ---------- Organizer ----------

/** Ownership-scoped lookup — 404 (not 403) outside scope (docs/02 §3). */
async function getOwnedEvent(eventId: number, organizerId: number, isAdmin = false): Promise<Event> {
  const event = await Event.findByPk(eventId, { include: fullInclude });
  if (!event || (!isAdmin && event.organizerId !== organizerId)) {
    throw new AppError(404, "NOT_FOUND", "Event not found");
  }
  return event;
}

export async function listForOrganizer(
  organizerId: number,
  query: EventStatusFilterQuery,
): Promise<{ rows: Event[]; meta: Meta }> {
  const where: WhereOptions = {
    organizerId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { title: { [Op.like]: `%${query.search}%` } } : {}),
  };
  const { rows, count } = await Event.findAndCountAll({
    where,
    include: fullInclude,
    order: [["createdAt", "DESC"]],
    distinct: true,
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

async function validateReferences(input: EventCreateInput): Promise<void> {
  const [category, venue] = await Promise.all([Category.findByPk(input.categoryId), Venue.findByPk(input.venueId)]);
  if (!category || !category.isActive) throw new AppError(422, "VALIDATION_ERROR", "Category not found or inactive");
  if (!venue) throw new AppError(422, "VALIDATION_ERROR", "Venue not found");
  if (input.capacity > venue.capacity) {
    throw new AppError(422, "VALIDATION_ERROR", `Capacity exceeds venue capacity (${venue.capacity})`);
  }
}

export async function createEvent(organizerId: number, input: EventCreateInput): Promise<Event> {
  await validateReferences(input);
  const event = await sequelize.transaction(async (t) => {
    const created = await Event.create(
      {
        organizerId,
        categoryId: input.categoryId,
        venueId: input.venueId,
        title: input.title,
        slug: uniqueSlug(input.title),
        description: input.description,
        bannerUrl: input.bannerUrl ?? null,
        startTime: input.startTime,
        endTime: input.endTime,
        registrationDeadline: input.registrationDeadline,
        capacity: input.capacity,
        rejectionReason: null,
        publishedAt: null,
        cancelledAt: null,
      },
      { transaction: t },
    );
    if (input.galleryImages.length) {
      await EventImage.bulkCreate(
        input.galleryImages.map((url, i) => ({ eventId: created.id, imageUrl: url, sortOrder: i })),
        { transaction: t },
      );
    }
    return created;
  });
  return getOwnedEvent(event.id, organizerId);
}

export async function updateEvent(eventId: number, organizerId: number, input: EventUpdateInput): Promise<Event> {
  const event = await getOwnedEvent(eventId, organizerId);
  if (!EDITABLE_STATUSES.includes(event.status)) {
    throw new AppError(409, "INVALID_STATE", `Events can only be edited while draft or rejected (current: ${event.status})`);
  }
  await validateReferences(input);

  await sequelize.transaction(async (t) => {
    await event.update(
      {
        categoryId: input.categoryId,
        venueId: input.venueId,
        title: input.title,
        description: input.description,
        bannerUrl: input.bannerUrl ?? null,
        startTime: input.startTime,
        endTime: input.endTime,
        registrationDeadline: input.registrationDeadline,
        capacity: input.capacity,
      },
      { transaction: t },
    );
    await EventImage.destroy({ where: { eventId }, transaction: t });
    if (input.galleryImages.length) {
      await EventImage.bulkCreate(
        input.galleryImages.map((url, i) => ({ eventId, imageUrl: url, sortOrder: i })),
        { transaction: t },
      );
    }
  });
  return getOwnedEvent(eventId, organizerId);
}

export async function deleteEvent(eventId: number, organizerId: number): Promise<void> {
  const event = await getOwnedEvent(eventId, organizerId);
  if (!EDITABLE_STATUSES.includes(event.status)) {
    throw new AppError(409, "INVALID_STATE", "Only draft or rejected events can be deleted");
  }
  await event.destroy();
}

export async function submitEvent(eventId: number, organizerId: number): Promise<Event> {
  const event = await getOwnedEvent(eventId, organizerId);
  if (!EDITABLE_STATUSES.includes(event.status)) {
    throw new AppError(409, "INVALID_STATE", "Only draft or rejected events can be submitted for approval");
  }
  const activeTickets = (event.ticketTypes ?? []).filter((t) => t.isActive);
  if (activeTickets.length === 0) {
    throw new AppError(422, "VALIDATION_ERROR", "Add at least one active ticket type before submitting");
  }
  const totalTickets = activeTickets.reduce((sum, t) => sum + t.quantityTotal, 0);
  if (totalTickets > event.capacity) {
    throw new AppError(422, "VALIDATION_ERROR", "Total ticket quantity exceeds event capacity");
  }
  await event.update({ status: "pending_approval", rejectionReason: null });
  return event;
}

export async function cancelEvent(eventId: number, organizerId: number, isAdmin = false): Promise<Event> {
  const event = await getOwnedEvent(eventId, organizerId, isAdmin);
  if (event.status !== "published") {
    throw new AppError(409, "INVALID_STATE", "Only published events can be cancelled");
  }
  await event.update({ status: "cancelled", cancelledAt: new Date() });
  notifyAttendeesOfCancellation(event).catch(() => undefined);
  return event;
}

/** Emails every attendee holding a confirmed booking (no-op until the bookings module lands). */
async function notifyAttendeesOfCancellation(event: Event): Promise<void> {
  const BookingModel = Event.sequelize?.models.Booking;
  if (!BookingModel) return;
  const bookings = (await BookingModel.findAll({
    where: { eventId: event.id, status: "confirmed" },
    include: [{ model: User, as: "attendee" }],
  })) as unknown as { attendee?: User }[];
  const { eventCancelledEmail } = await import("@/emails/templates.js");
  for (const booking of bookings) {
    if (!booking.attendee) continue;
    const tpl = eventCancelledEmail(booking.attendee.name, event.title);
    sendEmailAsync({
      userId: booking.attendee.id,
      to: booking.attendee.email,
      type: "event_cancelled",
      relatedType: "event",
      relatedId: event.id,
      ...tpl,
    });
  }
}

// ---------- Admin ----------

export async function listForAdmin(query: EventStatusFilterQuery): Promise<{ rows: Event[]; meta: Meta }> {
  const where: WhereOptions = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { title: { [Op.like]: `%${query.search}%` } } : {}),
  };
  const { rows, count } = await Event.findAndCountAll({
    where,
    include: fullInclude,
    order: [["createdAt", "DESC"]],
    distinct: true,
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

async function decisionEmailToOrganizer(event: Event, approved: boolean, reason?: string): Promise<void> {
  const organizer = await User.findByPk(event.organizerId);
  if (!organizer) return;
  const tpl = eventDecisionEmail(organizer.name, event.title, approved, reason);
  sendEmailAsync({
    userId: organizer.id,
    to: organizer.email,
    type: approved ? "event_approved" : "event_rejected",
    relatedType: "event",
    relatedId: event.id,
    ...tpl,
  });
}

export async function approveEvent(eventId: number): Promise<Event> {
  const event = await Event.findByPk(eventId, { include: fullInclude });
  if (!event) throw new AppError(404, "NOT_FOUND", "Event not found");
  if (event.status !== "pending_approval") {
    throw new AppError(409, "INVALID_STATE", "Only events pending approval can be approved");
  }
  await event.update({ status: "published", publishedAt: new Date(), rejectionReason: null });
  await decisionEmailToOrganizer(event, true);
  return event;
}

export async function rejectEvent(eventId: number, reason: string): Promise<Event> {
  const event = await Event.findByPk(eventId, { include: fullInclude });
  if (!event) throw new AppError(404, "NOT_FOUND", "Event not found");
  if (event.status !== "pending_approval") {
    throw new AppError(409, "INVALID_STATE", "Only events pending approval can be rejected");
  }
  await event.update({ status: "rejected", rejectionReason: reason });
  await decisionEmailToOrganizer(event, false, reason);
  return event;
}

export async function toggleFeature(eventId: number): Promise<Event> {
  const event = await Event.findByPk(eventId, { include: fullInclude });
  if (!event) throw new AppError(404, "NOT_FOUND", "Event not found");
  await event.update({ isFeatured: !event.isFeatured });
  return event;
}
