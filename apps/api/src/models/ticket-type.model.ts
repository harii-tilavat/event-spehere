import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/config/database.js";
import type { Event } from "@/models/event.model.js";

export class TicketType extends Model<InferAttributes<TicketType>, InferCreationAttributes<TicketType>> {
  declare id: CreationOptional<number>;
  declare eventId: ForeignKey<Event["id"]>;
  declare name: string;
  declare description: string | null;
  declare pricePaise: number;
  declare quantityTotal: number;
  declare quantitySold: CreationOptional<number>;
  declare maxPerBooking: CreationOptional<number>;
  declare saleStart: Date | null;
  declare saleEnd: Date | null;
  declare isActive: CreationOptional<boolean>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

TicketType.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(300), allowNull: true },
    pricePaise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantityTotal: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantitySold: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    maxPerBooking: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 10 },
    saleStart: { type: DataTypes.DATE, allowNull: true },
    saleEnd: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "ticket_types" },
);
