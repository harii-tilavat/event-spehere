import type { CookieOptions, Request, Response } from "express";
import { isProd } from "@/config/env.js";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import { toUserDto } from "@/utils/serializers.js";
import * as authService from "@/services/auth.service.js";
import type { Session } from "@/services/auth.service.js";

const REFRESH_COOKIE = "es_refresh";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  path: "/api/v1/auth",
};

function sessionMeta(req: Request) {
  return { userAgent: req.headers["user-agent"]?.slice(0, 255), ip: req.ip };
}

function respondWithSession(res: Response, message: string, session: Session, status = 200): void {
  res.cookie(REFRESH_COOKIE, session.refreshToken, { ...cookieOptions, expires: session.refreshExpiresAt });
  ok(res, message, { accessToken: session.accessToken, user: toUserDto(session.user, session.organizerProfile) }, { status });
}

export const register = asyncHandler(async (req, res) => {
  const session = await authService.register(req.body, sessionMeta(req));
  respondWithSession(res, "Account created — check your email to verify it", session, 201);
});

export const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body, sessionMeta(req));
  respondWithSession(res, "Logged in", session);
});

export const refresh = asyncHandler(async (req, res) => {
  const session = await authService.refresh(req.cookies?.[REFRESH_COOKIE] ?? "", sessionMeta(req));
  respondWithSession(res, "Session refreshed", session);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user!.id);
  ok(res, "Current user", { user: toUserDto(user) });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  ok(res, "Email verified", { user: toUserDto(user) });
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.user!.id);
  ok(res, "Verification email sent", null);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ok(res, "If an account exists for that email, a reset link has been sent", null);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  ok(res, "Password reset — you can now log in", null);
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword,
    req.cookies?.[REFRESH_COOKIE],
  );
  ok(res, "Password changed", null);
});
