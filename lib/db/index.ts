import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import "dotenv/config";

const connection = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1111",
  database: "member_db",
});

export const db = drizzle(connection, { schema, mode: "default" });
