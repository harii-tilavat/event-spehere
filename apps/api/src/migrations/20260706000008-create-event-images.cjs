"use strict";

/** Event gallery images per docs/03 §2.7. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("event_images", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      event_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "events", key: "id" },
        onDelete: "CASCADE",
      },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      sort_order: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("event_images");
  },
};
