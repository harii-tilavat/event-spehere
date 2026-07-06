"use strict";

/** Events per docs/03 §2.6 — lifecycle state machine with admin approval gate. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("events", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      organizer_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "categories", key: "id" },
      },
      venue_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "venues", key: "id" },
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(220), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      banner_url: { type: Sequelize.STRING(500), allowNull: true },
      status: {
        type: Sequelize.ENUM("draft", "pending_approval", "rejected", "published", "cancelled", "completed"),
        allowNull: false,
        defaultValue: "draft",
      },
      rejection_reason: { type: Sequelize.STRING(500), allowNull: true },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      registration_deadline: { type: Sequelize.DATE, allowNull: false },
      capacity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      published_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex("events", ["status", "start_time"], { name: "idx_events_status_start" });
    await queryInterface.addIndex("events", ["organizer_id"], { name: "idx_events_organizer" });
    await queryInterface.addIndex("events", ["category_id"], { name: "idx_events_category" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("events");
  },
};
