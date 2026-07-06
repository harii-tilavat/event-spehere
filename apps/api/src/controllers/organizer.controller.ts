import type { OrganizerListQuery } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import { toOrganizerProfileDto } from "@/utils/serializers.js";
import * as organizerService from "@/services/organizer.service.js";
import { toOrganizerApplicationDto } from "@/services/organizer.service.js";

export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await organizerService.listOrganizers(req.query as unknown as OrganizerListQuery);
  ok(res, "Organizers", { organizers: rows.map(toOrganizerApplicationDto) }, { meta });
});

export const detail = asyncHandler(async (req, res) => {
  const profile = await organizerService.getOrganizer(Number(req.params.id));
  ok(res, "Organizer", { organizer: toOrganizerApplicationDto(profile) });
});

export const decide = asyncHandler(async (req, res) => {
  const profile = await organizerService.decideOrganizer(Number(req.params.id), req.body, req.user!.id);
  ok(res, req.body.action === "approve" ? "Organizer approved" : "Organizer rejected", {
    organizer: toOrganizerProfileDto(profile),
  });
});

export const me = asyncHandler(async (req, res) => {
  const profile = await organizerService.getOwnProfile(req.user!.id);
  ok(res, "Organizer profile", { organizer: toOrganizerProfileDto(profile) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const profile = await organizerService.updateOwnProfile(req.user!.id, req.body);
  ok(res, "Organizer profile updated", { organizer: toOrganizerProfileDto(profile) });
});
