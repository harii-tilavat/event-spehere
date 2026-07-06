"use strict";

/** Ticket types per docs/03 §2.8 — quantity_sold guarded by row locks (docs/03 §4). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ticket_types", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      event_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "events", key: "id" },
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.STRING(300), allowNull: true },
      price_paise: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      quantity_total: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      quantity_sold: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      max_per_booking: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 10 },
      sale_start: { type: Sequelize.DATE, allowNull: true },
      sale_end: { type: Sequelize.DATE, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("ticket_types", ["event_id"], { name: "idx_ticket_types_event" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ticket_types");
  },
};
