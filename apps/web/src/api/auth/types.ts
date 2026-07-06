import type {
  ApiSuccess,
  AuthData,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UserDto,
} from "@eventsphere/shared";

export type { AuthData, ChangePasswordInput, LoginInput, RegisterInput, ResetPasswordInput, UserDto };

export type AuthResponse = ApiSuccess<AuthData>;
export type MeResponse = ApiSuccess<{ user: UserDto }>;
export type MessageResponse = ApiSuccess<null>;

export interface AuthMessage {
  message: string;
}

export interface VerifyEmailResult {
  user: UserDto;
}
