import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import type { OrganizerApprovalStatus } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import type { User } from "@/models/user.model.js";

export class OrganizerProfile extends Model<
  InferAttributes<OrganizerProfile>,
  InferCreationAttributes<OrganizerProfile>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare organizationName: string;
  declare description: string | null;
  declare website: string | null;
  declare logoUrl: string | null;
  declare approvalStatus: CreationOptional<OrganizerApprovalStatus>;
  declare rejectionReason: string | null;
  declare approvedBy: number | null;
  declare approvedAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

OrganizerProfile.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    organizationName: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    website: { type: DataTypes.STRING(255), allowNull: true },
    logoUrl: { type: DataTypes.STRING(500), allowNull: true },
    approvalStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    rejectionReason: { type: DataTypes.STRING(500), allowNull: true },
    approvedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "organizer_profiles" },
);
