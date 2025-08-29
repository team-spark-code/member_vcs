import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config"; // 분리된 설정 파일 import

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // 공통 설정 (pages)을 가져와서 전개
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const user = await db
            .select()
            .from(member)
            .where(eq(member.email, credentials.email as string))
            .limit(1);

          if (!user || user.length === 0 || !user[0].password) {
            console.log("User not found or no password");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user[0].password
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Login successful for user:", user[0].email);
          return {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            image: user[0].image,
          };
        } catch (error) {
          console.error("Database error during login:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // JWT 토큰에 사용자 ID를 포함시켜 세션에서 사용할 수 있도록 함
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    // 세션 객체에 사용자 ID를 추가
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
