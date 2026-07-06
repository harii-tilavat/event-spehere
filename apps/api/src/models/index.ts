import { User } from "@/models/user.model.js";
import { RefreshToken } from "@/models/refresh-token.model.js";
import { OrganizerProfile } from "@/models/organizer-profile.model.js";
import { Notification } from "@/models/notification.model.js";
import { Category } from "@/models/category.model.js";
import { Venue } from "@/models/venue.model.js";

// Associations (docs/03 §3)
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(OrganizerProfile, { foreignKey: "userId", as: "organizerProfile" });
OrganizerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, RefreshToken, OrganizerProfile, Notification, Category, Venue };
