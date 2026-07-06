import type { WhereOptions } from "sequelize";
import { Op } from "sequelize";
import type {
  Meta,
  OrganizerApplicationDto,
  OrganizerDecisionInput,
  OrganizerListQuery,
  OrganizerProfileUpdateInput,
} from "@eventsphere/shared";
import { OrganizerProfile, User } from "@/models/index.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";
import { toUserDto } from "@/utils/serializers.js";
import { sendEmailAsync } from "@/services/email.service.js";
import { organizerDecisionEmail } from "@/emails/templates.js";

export function toOrganizerApplicationDto(p: OrganizerProfile & { user?: User }): OrganizerApplicationDto {
  if (!p.user) throw new AppError(500, "INTERNAL_ERROR", "Organizer profile loaded without user");
  return {
    id: p.id,
    user: toUserDto(p.user),
    organizationName: p.organizationName,
    description: p.description,
    website: p.website,
    logoUrl: p.logoUrl,
    approvalStatus: p.approvalStatus,
    rejectionReason: p.rejectionReason,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function listOrganizers(
  query: OrganizerListQuery,
): Promise<{ rows: (OrganizerProfile & { user?: User })[]; meta: Meta }> {
  const where: WhereOptions = {
    ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
    ...(query.search ? { organizationName: { [Op.like]: `%${query.search}%` } } : {}),
  };
  const { rows, count } = await OrganizerProfile.findAndCountAll({
    where,
    include: [{ model: User, as: "user", required: true }],
    order: [["createdAt", "DESC"]],
    ...pageOptions(query),
  });
  return { rows: rows as (OrganizerProfile & { user?: User })[], meta: buildMeta(query, count) };
}

export async function getOrganizer(id: number): Promise<OrganizerProfile & { user?: User }> {
  const profile = (await OrganizerProfile.findByPk(id, {
    include: [{ model: User, as: "user" }],
  })) as (OrganizerProfile & { user?: User }) | null;
  if (!profile) throw new AppError(404, "NOT_FOUND", "Organizer not found");
  return profile;
}

export async function decideOrganizer(
  id: number,
  input: OrganizerDecisionInput,
  adminId: number,
): Promise<OrganizerProfile> {
  const profile = await getOrganizer(id);
  if (profile.approvalStatus === "approved" && input.action === "approve") {
    throw new AppError(409, "INVALID_STATE", "Organizer is already approved");
  }

  const approved = input.action === "approve";
  await profile.update({
    approvalStatus: approved ? "approved" : "rejected",
    rejectionReason: approved ? null : (input.reason ?? null),
    approvedBy: adminId,
    approvedAt: approved ? new Date() : null,
  });

  const user = profile.user!;
  const tpl = organizerDecisionEmail(user.name, approved, input.reason);
  sendEmailAsync({
    userId: user.id,
    to: user.email,
    type: approved ? "organizer_approved" : "organizer_rejected",
    relatedType: "organizer_profile",
    relatedId: profile.id,
    ...tpl,
  });
  return profile;
}

export async function getOwnProfile(userId: number): Promise<OrganizerProfile> {
  const profile = await OrganizerProfile.findOne({ where: { userId } });
  if (!profile) throw new AppError(404, "NOT_FOUND", "Organizer profile not found");
  return profile;
}

export async function updateOwnProfile(userId: number, input: OrganizerProfileUpdateInput): Promise<OrganizerProfile> {
  const profile = await getOwnProfile(userId);
  return profile.update({ ...input });
}
