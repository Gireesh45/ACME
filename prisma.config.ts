import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local for local development (Next.js convention)
config({ path: ".env.local" });
// Fallback to .env
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
