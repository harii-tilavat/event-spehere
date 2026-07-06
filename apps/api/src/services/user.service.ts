import { Op, type WhereOptions } from "sequelize";
import type { Meta, UpdateProfileInput, UserListQuery, UserStatus } from "@eventsphere/shared";
import { OrganizerProfile, RefreshToken, User } from "@/models/index.js";
import { AppError } from "@/utils/app-error.js";
import { buildMeta, pageOptions } from "@/utils/pagination.js";

export async function listUsers(query: UserListQuery): Promise<{ rows: User[]; meta: Meta }> {
  const where: WhereOptions = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? { [Op.or]: [{ name: { [Op.like]: `%${query.search}%` } }, { email: { [Op.like]: `%${query.search}%` } }] }
      : {}),
  };
  const { rows, count } = await User.findAndCountAll({
    where,
    include: [{ model: OrganizerProfile, as: "organizerProfile" }],
    order: [["createdAt", "DESC"]],
    ...pageOptions(query),
  });
  return { rows, meta: buildMeta(query, count) };
}

export async function getUser(id: number): Promise<User> {
  const user = await User.findByPk(id, { include: [{ model: OrganizerProfile, as: "organizerProfile" }] });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
  return user;
}

export async function setUserStatus(id: number, status: UserStatus, actorId: number): Promise<User> {
  if (id === actorId) throw new AppError(409, "INVALID_STATE", "You cannot change your own status");
  const user = await getUser(id);
  if (user.role === "super_admin") throw new AppError(403, "FORBIDDEN", "Super admin accounts cannot be suspended");
  await user.update({ status });
  if (status === "suspended") {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: id, revokedAt: null } });
  }
  return user;
}

export async function deleteUser(id: number, actorId: number): Promise<void> {
  if (id === actorId) throw new AppError(409, "INVALID_STATE", "You cannot delete your own account");
  const user = await getUser(id);
  if (user.role === "super_admin") throw new AppError(403, "FORBIDDEN", "Super admin accounts cannot be deleted");
  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: id, revokedAt: null } });
  await user.destroy(); // paranoid — soft delete
}

export async function updateProfile(userId: number, input: UpdateProfileInput): Promise<User> {
  const user = await getUser(userId);
  return user.update({
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.phone !== undefined ? { phone: input.phone ?? null } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
  });
}
