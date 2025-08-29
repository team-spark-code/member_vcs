import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  primaryKey,
  int,
} from "drizzle-orm/mysql-core";
import type { AdapterAccount } from "@auth/core/adapters";

// Member 테이블 (Auth.js와 호환)
export const member = mysqlTable("member", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }), // 사용자 이름
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"), // 해시된 비밀번호 저장
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).defaultNow(),
  image: varchar("image", { length: 255 }),
  // 추가된 필드들
  address: text("address"), // 주소
  postalCode: varchar("postal_code", { length: 10 }), // 우편번호
  createdAt: timestamp("created_at", {
    mode: "date",
    fsp: 3,
  }).defaultNow().notNull(), // 등록일시
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  }).defaultNow().onUpdateNow().notNull(), // 수정일시
  createdBy: varchar("created_by", { length: 255 }), // 만든사람
  updatedBy: varchar("updated_by", { length: 255 }), // 수정한사람
});

// Auth.js 세션 관리에 필요한 테이블들
export const accounts = mysqlTable(
  "accounts",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = mysqlTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = mysqlTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
