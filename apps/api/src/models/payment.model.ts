import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import type { PaymentStatus } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import type { Booking } from "@/models/booking.model.js";

export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<number>;
  declare bookingId: ForeignKey<Booking["id"]>;
  declare razorpayOrderId: string;
  declare razorpayPaymentId: string | null;
  declare razorpaySignature: string | null;
  declare amountPaise: number;
  declare currency: CreationOptional<string>;
  declare status: CreationOptional<PaymentStatus>;
  declare method: string | null;
  declare errorReason: string | null;
  declare refundId: string | null;
  declare refundedAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare booking?: NonAttribute<Booking>;
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    razorpayOrderId: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    razorpayPaymentId: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    razorpaySignature: { type: DataTypes.STRING(255), allowNull: true },
    amountPaise: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: "INR" },
    status: {
      type: DataTypes.ENUM("created", "captured", "failed", "refunded"),
      allowNull: false,
      defaultValue: "created",
    },
    method: { type: DataTypes.STRING(30), allowNull: true },
    errorReason: { type: DataTypes.STRING(500), allowNull: true },
    refundId: { type: DataTypes.STRING(64), allowNull: true },
    refundedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "payments" },
);
