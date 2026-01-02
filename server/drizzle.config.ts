import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { join } from "path";

export default defineConfig({
  out: join(__dirname, "drizzle"),
  schema: join(__dirname, "app", "db", "schema.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
