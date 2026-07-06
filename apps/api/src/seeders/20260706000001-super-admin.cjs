"use strict";

const bcrypt = require("bcryptjs");

/** Seeds the super admin (docs/02 §1 — cannot self-register). Dev credentials; change in production. */
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@eventsphere.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@1234";

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      { replacements: { email: ADMIN_EMAIL } },
    );
    if (existing.length > 0) return;

    const now = new Date();
    await queryInterface.bulkInsert("users", [
      {
        name: "Super Admin",
        email: ADMIN_EMAIL,
        password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 12),
        role: "super_admin",
        status: "active",
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: ADMIN_EMAIL });
  },
};
