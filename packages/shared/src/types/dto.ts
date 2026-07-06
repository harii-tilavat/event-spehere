import type { OrganizerApprovalStatus, Role, UserStatus } from "../constants/enums.js";

export interface OrganizerProfileDto {
  id: number;
  organizationName: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  approvalStatus: OrganizerApprovalStatus;
  rejectionReason: string | null;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  organizerProfile?: OrganizerProfileDto | null;
}

export interface AuthData {
  accessToken: string;
  user: UserDto;
}
