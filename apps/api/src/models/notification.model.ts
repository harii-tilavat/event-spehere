import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/config/database.js";
import type { User } from "@/models/user.model.js";

export class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare type: string;
  declare title: string;
  declare body: string;
  declare channel: CreationOptional<"email" | "in_app">;
  declare isRead: CreationOptional<boolean>;
  declare sentAt: Date | null;
  declare relatedType: string | null;
  declare relatedId: number | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    body: { type: DataTypes.STRING(1000), allowNull: false },
    channel: { type: DataTypes.ENUM("email", "in_app"), allowNull: false, defaultValue: "email" },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    sentAt: { type: DataTypes.DATE, allowNull: true },
    relatedType: { type: DataTypes.STRING(30), allowNull: true },
    relatedId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "notifications" },
);
