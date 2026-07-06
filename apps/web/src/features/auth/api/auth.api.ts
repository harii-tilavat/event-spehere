import type { UserDto } from "@eventsphere/shared";
import { post, postWithMessage } from "@/lib/axios";

export function verifyEmail(token: string): Promise<{ user: UserDto }> {
  return post<{ user: UserDto }>("/auth/verify-email", { token });
}

export function resendVerification(): Promise<{ message: string }> {
  return postWithMessage<null>("/auth/resend-verification").then(({ message }) => ({ message }));
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return postWithMessage<null>("/auth/forgot-password", { email }).then(({ message }) => ({ message }));
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return postWithMessage<null>("/auth/reset-password", { token, newPassword }).then(({ message }) => ({ message }));
}

export function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return postWithMessage<null>("/auth/change-password", { currentPassword, newPassword }).then(({ message }) => ({
    message,
  }));
}
