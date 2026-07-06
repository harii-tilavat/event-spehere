import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import * as venueService from "@/services/venue.service.js";
import { toVenueDto } from "@/services/venue.service.js";
import type { PaginationQuery } from "@eventsphere/shared";

export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await venueService.listVenues(
    req.query as unknown as PaginationQuery & { city?: string },
  );
  ok(res, "Venues", { venues: rows.map(toVenueDto) }, { meta });
});

export const detail = asyncHandler(async (req, res) => {
  const venue = await venueService.getVenue(Number(req.params.id));
  ok(res, "Venue", { venue: toVenueDto(venue) });
});

export const create = asyncHandler(async (req, res) => {
  const venue = await venueService.createVenue(req.body);
  ok(res, "Venue created", { venue: toVenueDto(venue) }, { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  const venue = await venueService.updateVenue(Number(req.params.id), req.body);
  ok(res, "Venue updated", { venue: toVenueDto(venue) });
});

export const remove = asyncHandler(async (req, res) => {
  await venueService.deleteVenue(Number(req.params.id));
  res.status(204).end();
});
