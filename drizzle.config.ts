import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit não lê o .env.local sozinho.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
