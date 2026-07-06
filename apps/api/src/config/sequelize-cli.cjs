// Used only by sequelize-cli (migrations/seeders); the app itself uses config/database.ts
require("dotenv").config();

const common = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "eventsphere",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  dialect: "mysql",
};

module.exports = {
  development: common,
  production: common,
};
