"use strict";

/** Bookings per docs/03 §2.9 — pending holds inventory with a TTL. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      booking_number: { type: Sequelize.CHAR(12), allowNull: false, unique: true },
      attendee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      event_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "events", key: "id" },
      },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "cancelled", "expired", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      total_amount_paise: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex("bookings", ["attendee_id", "status"], { name: "idx_bookings_attendee_status" });
    await queryInterface.addIndex("bookings", ["event_id", "status"], { name: "idx_bookings_event_status" });
    await queryInterface.addIndex("bookings", ["status", "expires_at"], { name: "idx_bookings_status_expires" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bookings");
  },
};
