import type { EventListQuery, EventStatusFilterQuery } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as eventService from "@/services/event.service.js";
import { toEventDetailDto, toEventListItemDto, toOrganizerEventDto } from "@/services/event.service.js";

export const listPublic = asyncHandler(async (req, res) => {
  const { rows, meta } = await eventService.listPublished(req.query as unknown as EventListQuery);
  ok(res, "Events", { events: rows.map(toEventListItemDto) }, { meta });
});

export const detail = asyncHandler(async (req, res) => {
  const viewer = req.user ? { id: req.user.id, role: req.user.role } : undefined;
  const event = await eventService.getBySlug(req.params.slug, viewer);
  ok(res, "Event", { event: await toEventDetailDto(event) });
});

export const listMine = asyncHandler(async (req, res) => {
  const { rows, meta } = await eventService.listForOrganizer(
    req.user!.id,
    req.query as unknown as EventStatusFilterQuery,
  );
  ok(res, "Your events", { events: rows.map(toOrganizerEventDto) }, { meta });
});

export const create = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user!.id, req.body);
  ok(res, "Event created as draft", { event: await toEventDetailDto(event) }, { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(Number(req.params.id), req.user!.id, req.body);
  ok(res, "Event updated", { event: await toEventDetailDto(event) });
});

export const remove = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(Number(req.params.id), req.user!.id);
  res.status(204).end();
});

export const submit = asyncHandler(async (req, res) => {
  const event = await eventService.submitEvent(Number(req.params.id), req.user!.id);
  ok(res, "Event submitted for approval", { event: await toEventDetailDto(event) });
});

export const cancel = asyncHandler(async (req, res) => {
  const event = await eventService.cancelEvent(Number(req.params.id), req.user!.id, req.user!.role === "super_admin");
  ok(res, "Event cancelled — attendees will be notified", { event: await toEventDetailDto(event) });
});

export const listAdmin = asyncHandler(async (req, res) => {
  const { rows, meta } = await eventService.listForAdmin(req.query as unknown as EventStatusFilterQuery);
  ok(res, "Events", { events: rows.map(toOrganizerEventDto) }, { meta });
});

export const approve = asyncHandler(async (req, res) => {
  const event = await eventService.approveEvent(Number(req.params.id));
  ok(res, "Event approved and published", { event: await toEventDetailDto(event) });
});

export const reject = asyncHandler(async (req, res) => {
  const event = await eventService.rejectEvent(Number(req.params.id), req.body.reason);
  ok(res, "Event rejected", { event: await toEventDetailDto(event) });
});

export const toggleFeature = asyncHandler(async (req, res) => {
  const event = await eventService.toggleFeature(Number(req.params.id));
  ok(res, event.isFeatured ? "Event featured" : "Event unfeatured", { event: await toEventDetailDto(event) });
});
