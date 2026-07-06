import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import type { Role, UserStatus } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: CreationOptional<Role>;
  declare status: CreationOptional<UserStatus>;
  declare phone: string | null;
  declare avatarUrl: string | null;
  declare isEmailVerified: CreationOptional<boolean>;
  declare emailVerifyTokenHash: string | null;
  declare emailVerifyExpiresAt: Date | null;
  declare passwordResetTokenHash: string | null;
  declare passwordResetExpiresAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM("super_admin", "organizer", "attendee"),
      allowNull: false,
      defaultValue: "attendee",
    },
    status: { type: DataTypes.ENUM("active", "suspended"), allowNull: false, defaultValue: "active" },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
    isEmailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    emailVerifyTokenHash: { type: DataTypes.STRING(255), allowNull: true },
    emailVerifyExpiresAt: { type: DataTypes.DATE, allowNull: true },
    passwordResetTokenHash: { type: DataTypes.STRING(255), allowNull: true },
    passwordResetExpiresAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "users",
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ["passwordHash", "emailVerifyTokenHash", "passwordResetTokenHash"],
      },
    },
    scopes: {
      withSensitive: {},
    },
  },
);
