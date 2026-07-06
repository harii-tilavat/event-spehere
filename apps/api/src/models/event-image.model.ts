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

export class EventImage extends Model<InferAttributes<EventImage>, InferCreationAttributes<EventImage>> {
  declare id: CreationOptional<number>;
  declare eventId: ForeignKey<Event["id"]>;
  declare imageUrl: string;
  declare sortOrder: CreationOptional<number>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

EventImage.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    imageUrl: { type: DataTypes.STRING(500), allowNull: false },
    sortOrder: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "event_images" },
);
