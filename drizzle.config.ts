import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from the .env file
config();

const dbUrl = process.env.DATABASE_URL;
console.log("DATABASE_URL:", dbUrl);

if (!dbUrl) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
