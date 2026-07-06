"use strict";

/** Notifications per docs/03 §2.13 — email log (MVP) + in-app feed. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      type: { type: Sequelize.STRING(50), allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      body: { type: Sequelize.STRING(1000), allowNull: false },
      channel: { type: Sequelize.ENUM("email", "in_app"), allowNull: false, defaultValue: "email" },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      related_type: { type: Sequelize.STRING(30), allowNull: true },
      related_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("notifications", ["user_id", "is_read", "created_at"], {
      name: "idx_notifications_user_read_created",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notifications");
  },
};
