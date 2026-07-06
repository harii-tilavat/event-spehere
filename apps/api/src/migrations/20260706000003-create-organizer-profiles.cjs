"use strict";

/** Organizer profiles per docs/03 §2.3 — 1:1 with users, admin approval gate. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("organizer_profiles", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      organization_name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      website: { type: Sequelize.STRING(255), allowNull: true },
      logo_url: { type: Sequelize.STRING(500), allowNull: true },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      rejection_reason: { type: Sequelize.STRING(500), allowNull: true },
      approved_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      approved_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("organizer_profiles");
  },
};
