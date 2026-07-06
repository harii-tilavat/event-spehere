import { env } from "@/config/env.js";
import { connectDatabase } from "@/config/database.js";
import { createApp } from "@/app.js";

async function main(): Promise<void> {
  await connectDatabase();
  console.log(`Database connected (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME})`);

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`EventSphere API listening on http://localhost:${env.PORT}/api/v1`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
