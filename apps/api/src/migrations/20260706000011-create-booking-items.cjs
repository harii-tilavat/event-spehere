"use strict";

/** Booking items per docs/03 §2.10 — price snapshot at booking time. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("booking_items", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      booking_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "bookings", key: "id" },
        onDelete: "CASCADE",
      },
      ticket_type_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "ticket_types", key: "id" },
      },
      quantity: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
      unit_price_paise: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      subtotal_paise: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("booking_items");
  },
};
