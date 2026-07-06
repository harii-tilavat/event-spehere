import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as ticketTypeService from "@/services/ticket-type.service.js";
import { toTicketTypeDto } from "@/services/event.service.js";

export const list = asyncHandler(async (req, res) => {
  const ticketTypes = await ticketTypeService.listForEvent(Number(req.params.eventId));
  ok(res, "Ticket types", { ticketTypes: ticketTypes.map(toTicketTypeDto) });
});

export const create = asyncHandler(async (req, res) => {
  const ticketType = await ticketTypeService.createTicketType(
    Number(req.params.eventId),
    req.user!.id,
    req.user!.role === "super_admin",
    req.body,
  );
  ok(res, "Ticket type created", { ticketType: toTicketTypeDto(ticketType) }, { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  const ticketType = await ticketTypeService.updateTicketType(
    Number(req.params.id),
    req.user!.id,
    req.user!.role === "super_admin",
    req.body,
  );
  ok(res, "Ticket type updated", { ticketType: toTicketTypeDto(ticketType) });
});

export const remove = asyncHandler(async (req, res) => {
  await ticketTypeService.deleteTicketType(Number(req.params.id), req.user!.id, req.user!.role === "super_admin");
  res.status(204).end();
});
