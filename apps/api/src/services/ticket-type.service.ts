import type { TicketTypeCreateInput, TicketTypeUpdateInput } from "@eventsphere/shared";
import { AppError } from "@/utils/app-error.js";
import { Event, TicketType } from "@/models/index.js";

async function getOwnedEventOrThrow(eventId: number, organizerId: number, isAdmin: boolean): Promise<Event> {
  const event = await Event.findByPk(eventId, { include: [{ model: TicketType, as: "ticketTypes" }] });
  if (!event || (!isAdmin && event.organizerId !== organizerId)) {
    throw new AppError(404, "NOT_FOUND", "Event not found");
  }
  return event;
}

export async function listForEvent(eventId: number): Promise<TicketType[]> {
  return TicketType.findAll({ where: { eventId }, order: [["pricePaise", "ASC"]] });
}

export async function createTicketType(
  eventId: number,
  organizerId: number,
  isAdmin: boolean,
  input: TicketTypeCreateInput,
): Promise<TicketType> {
  const event = await getOwnedEventOrThrow(eventId, organizerId, isAdmin);
  if (["cancelled", "completed"].includes(event.status)) {
    throw new AppError(409, "INVALID_STATE", "Cannot add tickets to a cancelled or completed event");
  }

  const existingTotal = (event.ticketTypes ?? []).reduce((sum, t) => sum + t.quantityTotal, 0);
  if (existingTotal + input.quantityTotal > event.capacity) {
    throw new AppError(422, "VALIDATION_ERROR", `Total ticket quantity would exceed event capacity (${event.capacity})`);
  }

  return TicketType.create({
    eventId,
    name: input.name,
    description: input.description ?? null,
    pricePaise: input.pricePaise,
    quantityTotal: input.quantityTotal,
    maxPerBooking: input.maxPerBooking,
    saleStart: input.saleStart ?? null,
    saleEnd: input.saleEnd ?? null,
    isActive: input.isActive,
  });
}

async function getOwnedTicketType(ticketTypeId: number, organizerId: number, isAdmin: boolean): Promise<{ ticketType: TicketType; event: Event }> {
  const ticketType = await TicketType.findByPk(ticketTypeId, { include: [{ model: Event, as: "event" }] });
  const event = (ticketType as (TicketType & { event?: Event }) | null)?.event;
  if (!ticketType || !event || (!isAdmin && event.organizerId !== organizerId)) {
    throw new AppError(404, "NOT_FOUND", "Ticket type not found");
  }
  return { ticketType, event };
}

export async function updateTicketType(
  ticketTypeId: number,
  organizerId: number,
  isAdmin: boolean,
  input: TicketTypeUpdateInput,
): Promise<TicketType> {
  const { ticketType, event } = await getOwnedTicketType(ticketTypeId, organizerId, isAdmin);

  // Once tickets are sold, only quantity increases + activation changes are allowed (docs/04 §8)
  if (ticketType.quantitySold > 0) {
    if (input.pricePaise !== undefined && input.pricePaise !== ticketType.pricePaise) {
      throw new AppError(409, "INVALID_STATE", "Price cannot change after tickets have been sold");
    }
    if (input.quantityTotal !== undefined && input.quantityTotal < ticketType.quantityTotal) {
      throw new AppError(409, "INVALID_STATE", "Quantity cannot be reduced after tickets have been sold");
    }
  }

  if (input.quantityTotal !== undefined) {
    if (input.quantityTotal < ticketType.quantitySold) {
      throw new AppError(422, "VALIDATION_ERROR", "Quantity cannot be lower than tickets already sold");
    }
    const siblings = await TicketType.findAll({ where: { eventId: event.id } });
    const otherTotal = siblings.filter((t) => t.id !== ticketType.id).reduce((sum, t) => sum + t.quantityTotal, 0);
    if (otherTotal + input.quantityTotal > event.capacity) {
      throw new AppError(422, "VALIDATION_ERROR", `Total ticket quantity would exceed event capacity (${event.capacity})`);
    }
  }

  return ticketType.update({ ...input });
}

export async function deleteTicketType(ticketTypeId: number, organizerId: number, isAdmin: boolean): Promise<void> {
  const { ticketType } = await getOwnedTicketType(ticketTypeId, organizerId, isAdmin);
  if (ticketType.quantitySold > 0) {
    throw new AppError(409, "CONFLICT", "Ticket types with sales cannot be deleted — deactivate instead");
  }
  const BookingItemModel = TicketType.sequelize?.models.BookingItem;
  if (BookingItemModel) {
    const count = await BookingItemModel.count({ where: { ticketTypeId } });
    if (count > 0) throw new AppError(409, "CONFLICT", "Ticket type is referenced by bookings and cannot be deleted");
  }
  await ticketType.destroy();
}
