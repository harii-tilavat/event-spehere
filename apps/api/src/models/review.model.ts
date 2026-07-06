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
import type { Event } from "@/models/event.model.js";
import type { User } from "@/models/user.model.js";

export class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
  declare id: CreationOptional<number>;
  declare eventId: ForeignKey<Event["id"]>;
  declare attendeeId: ForeignKey<User["id"]>;
  declare rating: number;
  declare comment: string | null;
  declare organizerReply: string | null;
  declare repliedAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  declare attendee?: NonAttribute<User>;
  declare event?: NonAttribute<Event>;
}

Review.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    comment: { type: DataTypes.STRING(1000), allowNull: true },
    organizerReply: { type: DataTypes.STRING(1000), allowNull: true },
    repliedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "reviews", paranoid: true },
);
