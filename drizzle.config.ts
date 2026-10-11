import { defineConfig } from "drizzle-kit"

process.loadEnvFile()

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema",
  out: "./drizzle",
  dbCredentials: {
    // Migrations need a direct (non-pgbouncer) connection.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
})
