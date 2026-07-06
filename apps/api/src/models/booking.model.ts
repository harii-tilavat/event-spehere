import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import type { BookingStatus } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import type { User } from "@/models/user.model.js";
import type { Event } from "@/models/event.model.js";
import type { BookingItem } from "@/models/booking-item.model.js";
import type { Payment } from "@/models/payment.model.js";

export class Booking extends Model<InferAttributes<Booking>, InferCreationAttributes<Booking>> {
  declare id: CreationOptional<number>;
  declare bookingNumber: string;
  declare attendeeId: ForeignKey<User["id"]>;
  declare eventId: ForeignKey<Event["id"]>;
  declare status: CreationOptional<BookingStatus>;
  declare totalAmountPaise: number;
  declare expiresAt: Date | null;
  declare cancelledAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  declare attendee?: NonAttribute<User>;
  declare event?: NonAttribute<Event>;
  declare items?: NonAttribute<BookingItem[]>;
  declare payments?: NonAttribute<Payment[]>;
}

Booking.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    bookingNumber: { type: DataTypes.CHAR(12), allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "expired", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    totalAmountPaise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    cancelledAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "bookings", paranoid: true },
);
