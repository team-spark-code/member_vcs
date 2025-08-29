import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "mysql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "1111",
    database: "redfin",
  },
});
