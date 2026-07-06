import type { OrganizerProfileDto, UserDto } from "@eventsphere/shared";
import type { OrganizerProfile, User } from "@/models/index.js";

export function toOrganizerProfileDto(p: OrganizerProfile): OrganizerProfileDto {
  return {
    id: p.id,
    organizationName: p.organizationName,
    description: p.description,
    website: p.website,
    logoUrl: p.logoUrl,
    approvalStatus: p.approvalStatus,
    rejectionReason: p.rejectionReason,
  };
}

export function toUserDto(user: User, organizerProfile?: OrganizerProfile | null): UserDto {
  const profile = organizerProfile ?? (user as User & { organizerProfile?: OrganizerProfile }).organizerProfile;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt.toISOString(),
    organizerProfile: profile ? toOrganizerProfileDto(profile) : null,
  };
}
