import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/config/database.js";

export class Venue extends Model<InferAttributes<Venue>, InferCreationAttributes<Venue>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare addressLine: string;
  declare city: string;
  declare state: string;
  declare pincode: string | null;
  declare capacity: number;
  declare latitude: number | null;
  declare longitude: number | null;
  declare facilities: string[] | null;
  declare images: string[] | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

Venue.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    addressLine: { type: DataTypes.STRING(255), allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    state: { type: DataTypes.STRING(100), allowNull: false },
    pincode: { type: DataTypes.STRING(10), allowNull: true },
    capacity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    facilities: { type: DataTypes.JSON, allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "venues", paranoid: true },
);
