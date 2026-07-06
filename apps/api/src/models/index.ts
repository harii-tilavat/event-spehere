import { User } from "@/models/user.model.js";
import { RefreshToken } from "@/models/refresh-token.model.js";
import { OrganizerProfile } from "@/models/organizer-profile.model.js";
import { Notification } from "@/models/notification.model.js";
import { Category } from "@/models/category.model.js";
import { Venue } from "@/models/venue.model.js";
import { Event } from "@/models/event.model.js";
import { EventImage } from "@/models/event-image.model.js";
import { TicketType } from "@/models/ticket-type.model.js";
import { Booking } from "@/models/booking.model.js";
import { BookingItem } from "@/models/booking-item.model.js";
import { Payment } from "@/models/payment.model.js";
import { Ticket } from "@/models/ticket.model.js";
import { Review } from "@/models/review.model.js";
import { Wishlist } from "@/models/wishlist.model.js";

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

User.hasMany(Booking, { foreignKey: "attendeeId", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "attendeeId", as: "attendee" });

Event.hasMany(Booking, { foreignKey: "eventId", as: "bookings" });
Booking.belongsTo(Event, { foreignKey: "eventId", as: "event" });

Booking.hasMany(BookingItem, { foreignKey: "bookingId", as: "items" });
BookingItem.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

TicketType.hasMany(BookingItem, { foreignKey: "ticketTypeId", as: "bookingItems" });
BookingItem.belongsTo(TicketType, { foreignKey: "ticketTypeId", as: "ticketType" });

Booking.hasMany(Payment, { foreignKey: "bookingId", as: "payments" });
Payment.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

BookingItem.hasMany(Ticket, { foreignKey: "bookingItemId", as: "tickets" });
Ticket.belongsTo(BookingItem, { foreignKey: "bookingItemId", as: "bookingItem" });

Event.hasMany(Review, { foreignKey: "eventId", as: "reviews" });
Review.belongsTo(Event, { foreignKey: "eventId", as: "event" });
User.hasMany(Review, { foreignKey: "attendeeId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "attendeeId", as: "attendee" });

User.hasMany(Wishlist, { foreignKey: "userId", as: "wishlists" });
Wishlist.belongsTo(User, { foreignKey: "userId", as: "user" });
Event.hasMany(Wishlist, { foreignKey: "eventId", as: "wishlists" });
Wishlist.belongsTo(Event, { foreignKey: "eventId", as: "event" });

export {
  User,
  RefreshToken,
  OrganizerProfile,
  Notification,
  Category,
  Venue,
  Event,
  EventImage,
  TicketType,
  Booking,
  BookingItem,
  Payment,
  Ticket,
  Review,
  Wishlist,
};
