import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "@/config/database.js";
import type { Booking } from "@/models/booking.model.js";
import type { TicketType } from "@/models/ticket-type.model.js";
import type { Ticket } from "@/models/ticket.model.js";

export class BookingItem extends Model<InferAttributes<BookingItem>, InferCreationAttributes<BookingItem>> {
  declare id: CreationOptional<number>;
  declare bookingId: ForeignKey<Booking["id"]>;
  declare ticketTypeId: ForeignKey<TicketType["id"]>;
  declare quantity: number;
  declare unitPricePaise: number;
  declare subtotalPaise: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare ticketType?: NonAttribute<TicketType>;
  declare tickets?: NonAttribute<Ticket[]>;
}

BookingItem.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    unitPricePaise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    subtotalPaise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "booking_items" },
);
