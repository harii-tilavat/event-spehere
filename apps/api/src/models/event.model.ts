import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import type { EventStatus } from "@eventsphere/shared";
import { sequelize } from "@/config/database.js";
import type { User } from "@/models/user.model.js";
import type { Category } from "@/models/category.model.js";
import type { Venue } from "@/models/venue.model.js";
import type { EventImage } from "@/models/event-image.model.js";
import type { TicketType } from "@/models/ticket-type.model.js";

export class Event extends Model<InferAttributes<Event>, InferCreationAttributes<Event>> {
  declare id: CreationOptional<number>;
  declare organizerId: ForeignKey<User["id"]>;
  declare categoryId: ForeignKey<Category["id"]>;
  declare venueId: ForeignKey<Venue["id"]>;
  declare title: string;
  declare slug: string;
  declare description: string;
  declare bannerUrl: string | null;
  declare status: CreationOptional<EventStatus>;
  declare rejectionReason: string | null;
  declare startTime: Date;
  declare endTime: Date;
  declare registrationDeadline: Date;
  declare capacity: number;
  declare isFeatured: CreationOptional<boolean>;
  declare publishedAt: Date | null;
  declare cancelledAt: Date | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  declare organizer?: NonAttribute<User>;
  declare category?: NonAttribute<Category>;
  declare venue?: NonAttribute<Venue>;
  declare images?: NonAttribute<EventImage[]>;
  declare ticketTypes?: NonAttribute<TicketType[]>;
}

Event.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    bannerUrl: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.ENUM("draft", "pending_approval", "rejected", "published", "cancelled", "completed"),
      allowNull: false,
      defaultValue: "draft",
    },
    rejectionReason: { type: DataTypes.STRING(500), allowNull: true },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    registrationDeadline: { type: DataTypes.DATE, allowNull: false },
    capacity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    cancelledAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "events", paranoid: true },
);
