import type { ApiSuccess, Meta, UpdateProfileInput, UserDto, UserStatus } from "@eventsphere/shared";

export type { UpdateProfileInput, UserDto, UserStatus };

export interface GetUsersParams {
  page?: number;
  search?: string;
  role?: string;
  status?: string;
}

export type UsersResponse = ApiSuccess<{ users: UserDto[] }>;
export type UserResponse = ApiSuccess<{ user: UserDto }>;

export interface UsersPage {
  rows: UserDto[];
  meta?: Meta;
}

export interface SetUserStatusVariables {
  id: number;
  status: UserStatus;
}
