"use strict";

/** Payments per docs/03 §2.12 — razorpay_order_id is the idempotency anchor. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      booking_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "bookings", key: "id" },
      },
      razorpay_order_id: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      razorpay_payment_id: { type: Sequelize.STRING(64), allowNull: true, unique: true },
      razorpay_signature: { type: Sequelize.STRING(255), allowNull: true },
      amount_paise: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      currency: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: "INR" },
      status: {
        type: Sequelize.ENUM("created", "captured", "failed", "refunded"),
        allowNull: false,
        defaultValue: "created",
      },
      method: { type: Sequelize.STRING(30), allowNull: true },
      error_reason: { type: Sequelize.STRING(500), allowNull: true },
      refund_id: { type: Sequelize.STRING(64), allowNull: true },
      refunded_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  },
};
