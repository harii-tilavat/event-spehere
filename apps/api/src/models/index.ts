import { User } from "@/models/user.model.js";
import { RefreshToken } from "@/models/refresh-token.model.js";
import { OrganizerProfile } from "@/models/organizer-profile.model.js";
import { Notification } from "@/models/notification.model.js";
import { Category } from "@/models/category.model.js";
import { Venue } from "@/models/venue.model.js";
import { Event } from "@/models/event.model.js";
import { EventImage } from "@/models/event-image.model.js";
import { TicketType } from "@/models/ticket-type.model.js";

// Associations (docs/03 §3)
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(OrganizerProfile, { foreignKey: "userId", as: "organizerProfile" });
OrganizerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Event, { foreignKey: "organizerId", as: "events" });
Event.belongsTo(User, { foreignKey: "organizerId", as: "organizer" });

Category.hasMany(Event, { foreignKey: "categoryId", as: "events" });
Event.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

Venue.hasMany(Event, { foreignKey: "venueId", as: "events" });
Event.belongsTo(Venue, { foreignKey: "venueId", as: "venue" });

Event.hasMany(EventImage, { foreignKey: "eventId", as: "images" });
EventImage.belongsTo(Event, { foreignKey: "eventId", as: "event" });

Event.hasMany(TicketType, { foreignKey: "eventId", as: "ticketTypes" });
TicketType.belongsTo(Event, { foreignKey: "eventId", as: "event" });

export { User, RefreshToken, OrganizerProfile, Notification, Category, Venue, Event, EventImage, TicketType };
