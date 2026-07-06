import type { UserListQuery } from "@eventsphere/shared";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import { toUserDto } from "@/utils/serializers.js";
import * as userService from "@/services/user.service.js";

export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await userService.listUsers(req.query as unknown as UserListQuery);
  ok(res, "Users", { users: rows.map((u) => toUserDto(u)) }, { meta });
});

export const detail = asyncHandler(async (req, res) => {
  const user = await userService.getUser(Number(req.params.id));
  ok(res, "User", { user: toUserDto(user) });
});

export const setStatus = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(Number(req.params.id), req.body.status, req.user!.id);
  ok(res, `User ${req.body.status === "suspended" ? "suspended" : "activated"}`, { user: toUserDto(user) });
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(Number(req.params.id), req.user!.id);
  res.status(204).end();
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  ok(res, "Profile updated", { user: toUserDto(user) });
});
