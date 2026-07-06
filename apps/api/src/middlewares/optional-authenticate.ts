import { asyncHandler } from "@/utils/async-handler.js";
import { verifyAccessToken } from "@/utils/crypto.js";
import { User } from "@/models/index.js";

/** Loads req.user when a valid Bearer token is present; anonymous requests pass through. */
export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice(7));
      const user = await User.findByPk(Number(payload.sub));
      if (user && user.status === "active") req.user = user;
    } catch {
      // invalid/expired token on a public route — treat as anonymous
    }
  }
  next();
});
