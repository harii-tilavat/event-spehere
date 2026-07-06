"use strict";

/** Users table per docs/03 §2.1 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: {
        type: Sequelize.ENUM("super_admin", "organizer", "attendee"),
        allowNull: false,
        defaultValue: "attendee",
      },
      status: { type: Sequelize.ENUM("active", "suspended"), allowNull: false, defaultValue: "active" },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      is_email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      email_verify_token_hash: { type: Sequelize.STRING(255), allowNull: true },
      email_verify_expires_at: { type: Sequelize.DATE, allowNull: true },
      password_reset_token_hash: { type: Sequelize.STRING(255), allowNull: true },
      password_reset_expires_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex("users", ["role", "status"], { name: "idx_users_role_status" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
