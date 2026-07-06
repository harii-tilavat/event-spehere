import { Sequelize } from "sequelize";
import { env, isProd } from "@/config/env.js";

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "mysql",
  logging: isProd ? false : console.log,
  define: {
    underscored: true,
  },
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
}
