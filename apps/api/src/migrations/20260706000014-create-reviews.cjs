"use strict";

/** Reviews per docs/03 §2.14 — one per attendee per event. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      event_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "events", key: "id" },
      },
      attendee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      rating: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
      comment: { type: Sequelize.STRING(1000), allowNull: true },
      organizer_reply: { type: Sequelize.STRING(1000), allowNull: true },
      replied_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex("reviews", ["event_id", "attendee_id"], {
      unique: true,
      name: "uq_reviews_event_attendee",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reviews");
  },
};
