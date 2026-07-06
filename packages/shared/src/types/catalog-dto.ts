import type { OrganizerApprovalStatus } from "../constants/enums.js";
import type { UserDto } from "./dto.js";

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface VenueDto {
  id: number;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string | null;
  capacity: number;
  latitude: number | null;
  longitude: number | null;
  facilities: string[];
  images: string[];
  createdAt: string;
}

export interface OrganizerApplicationDto {
  id: number;
  user: UserDto;
  organizationName: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  approvalStatus: OrganizerApprovalStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface UploadResultDto {
  url: string;
  provider: "local" | "cloudinary";
}
