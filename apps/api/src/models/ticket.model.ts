import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import type { TicketStatus } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import type { BookingItem } from "@/models/booking-item.model.js";

export class Ticket extends Model<InferAttributes<Ticket>, InferCreationAttributes<Ticket>> {
  declare id: CreationOptional<number>;
  declare bookingItemId: ForeignKey<BookingItem["id"]>;
  declare ticketCode: string;
  declare status: CreationOptional<TicketStatus>;
  declare checkedInAt: Date | null;
  declare checkedInBy: number | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare bookingItem?: NonAttribute<BookingItem>;
}

Ticket.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    ticketCode: { type: DataTypes.CHAR(16), allowNull: false, unique: true },
    status: { type: DataTypes.ENUM("valid", "checked_in", "cancelled"), allowNull: false, defaultValue: "valid" },
    checkedInAt: { type: DataTypes.DATE, allowNull: true },
    checkedInBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "tickets" },
);
