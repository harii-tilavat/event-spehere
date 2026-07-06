"use strict";

/** Tickets per docs/03 §2.11 — one row per admission unit; doubles as attendance record. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tickets", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      booking_item_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "booking_items", key: "id" },
        onDelete: "CASCADE",
      },
      ticket_code: { type: Sequelize.CHAR(16), allowNull: false, unique: true },
      status: {
        type: Sequelize.ENUM("valid", "checked_in", "cancelled"),
        allowNull: false,
        defaultValue: "valid",
      },
      checked_in_at: { type: Sequelize.DATE, allowNull: true },
      checked_in_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tickets");
  },
};
