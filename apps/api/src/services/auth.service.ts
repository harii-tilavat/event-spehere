import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import type { LoginInput, RegisterInput } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import { env } from "@/config/env.js";
import { AppError } from "@/utils/app-error.js";
import { randomToken, sha256, signAccessToken } from "@/utils/crypto.js";
import { OrganizerProfile, RefreshToken, User } from "@/models/index.js";
import { sendEmailAsync } from "@/services/email.service.js";
import { passwordResetEmail, verificationEmail } from "@/emails/templates.js";

const BCRYPT_ROUNDS = 12;
const VERIFY_TOKEN_HOURS = 24;
const RESET_TOKEN_HOURS = 1;

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

async function issueSession(user: User, meta: SessionMeta): Promise<Session> {
  const refreshToken = randomToken(48);
  const refreshExpiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000);
  await RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: refreshExpiresAt,
    revokedAt: null,
    replacedById: null,
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
  });
  return { user, accessToken: signAccessToken(user.id, user.role), refreshToken, refreshExpiresAt };
}

function issueVerificationEmail(user: User): Promise<void> {
  const token = randomToken();
  return user
    .update({
      emailVerifyTokenHash: sha256(token),
      emailVerifyExpiresAt: new Date(Date.now() + VERIFY_TOKEN_HOURS * 3600 * 1000),
    })
    .then(() => {
      const tpl = verificationEmail(user.name, token);
      sendEmailAsync({ userId: user.id, to: user.email, type: "email_verification", ...tpl });
    });
}

export async function register(input: RegisterInput, meta: SessionMeta): Promise<Session> {
  const existing = await User.scope("withSensitive").findOne({ where: { email: input.email }, paranoid: false });
  if (existing) throw new AppError(409, "CONFLICT", "An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await sequelize.transaction(async (t) => {
    const created = await User.create(
      { name: input.name, email: input.email, passwordHash, role: input.role },
      { transaction: t },
    );
    if (input.role === "organizer") {
      await OrganizerProfile.create(
        { userId: created.id, organizationName: input.organizationName!, description: null, website: null, logoUrl: null, rejectionReason: null, approvedBy: null, approvedAt: null },
        { transaction: t },
      );
    }
    return created;
  });

  await issueVerificationEmail(user);
  return issueSession(user, meta);
}

export async function login(input: LoginInput, meta: SessionMeta): Promise<Session> {
  const user = await User.scope("withSensitive").findOne({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  if (user.status === "suspended") {
    throw new AppError(403, "FORBIDDEN", "Your account has been suspended");
  }
  return issueSession(user, meta);
}

export async function refresh(rawToken: string, meta: SessionMeta): Promise<Session> {
  const stored = await RefreshToken.findOne({ where: { tokenHash: sha256(rawToken) } });
  if (!stored) throw new AppError(401, "UNAUTHORIZED", "Invalid refresh token");

  if (stored.revokedAt) {
    // Reuse of a rotated token ⇒ assume theft; revoke the whole family (docs/08 §1)
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: stored.userId, revokedAt: null } },
    );
    throw new AppError(401, "UNAUTHORIZED", "Refresh token reuse detected — session revoked");
  }
  if (stored.expiresAt < new Date()) throw new AppError(401, "UNAUTHORIZED", "Refresh token expired");

  const user = await User.findByPk(stored.userId);
  if (!user || user.status === "suspended") throw new AppError(401, "UNAUTHORIZED", "Account unavailable");

  const session = await issueSession(user, meta);
  const replacement = await RefreshToken.findOne({ where: { tokenHash: sha256(session.refreshToken) } });
  await stored.update({ revokedAt: new Date(), replacedById: replacement?.id ?? null });
  return session;
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { tokenHash: sha256(rawToken), revokedAt: null } },
  );
}

export async function verifyEmail(token: string): Promise<User> {
  const user = await User.scope("withSensitive").findOne({
    where: { emailVerifyTokenHash: sha256(token), emailVerifyExpiresAt: { [Op.gt]: new Date() } },
  });
  if (!user) throw new AppError(422, "INVALID_STATE", "Verification link is invalid or expired");
  await user.update({ isEmailVerified: true, emailVerifyTokenHash: null, emailVerifyExpiresAt: null });
  return user;
}

export async function resendVerification(userId: number): Promise<void> {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
  if (user.isEmailVerified) throw new AppError(409, "INVALID_STATE", "Email is already verified");
  await issueVerificationEmail(user);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ where: { email } });
  if (!user) return; // uniform response — no account enumeration (docs/08 §1)
  const token = randomToken();
  await user.update({
    passwordResetTokenHash: sha256(token),
    passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_HOURS * 3600 * 1000),
  });
  const tpl = passwordResetEmail(user.name, token);
  sendEmailAsync({ userId: user.id, to: user.email, type: "password_reset", ...tpl });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await User.scope("withSensitive").findOne({
    where: { passwordResetTokenHash: sha256(token), passwordResetExpiresAt: { [Op.gt]: new Date() } },
  });
  if (!user) throw new AppError(422, "INVALID_STATE", "Reset link is invalid or expired");
  await user.update({
    passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  });
  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } });
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
  currentRefreshToken?: string,
): Promise<void> {
  const user = await User.scope("withSensitive").findByPk(userId);
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Current password is incorrect");
  }
  await user.update({ passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) });

  // Revoke every other session; keep the one making this request
  const keepHash = currentRefreshToken ? sha256(currentRefreshToken) : null;
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { userId, revokedAt: null, ...(keepHash ? { tokenHash: { [Op.ne]: keepHash } } : {}) } },
  );
}

export async function getMe(userId: number): Promise<User> {
  const user = await User.findByPk(userId, { include: [{ model: OrganizerProfile, as: "organizerProfile" }] });
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
  return user;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}
