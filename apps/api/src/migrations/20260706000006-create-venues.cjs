"use strict";

/** Venues per docs/03 §2.5. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("venues", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      address_line: { type: Sequelize.STRING(255), allowNull: false },
      city: { type: Sequelize.STRING(100), allowNull: false },
      state: { type: Sequelize.STRING(100), allowNull: false },
      pincode: { type: Sequelize.STRING(10), allowNull: true },
      capacity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      latitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      facilities: { type: Sequelize.JSON, allowNull: true },
      images: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex("venues", ["city"], { name: "idx_venues_city" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("venues");
  },
};
