"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

// Zod를 사용한 입력 데이터 유효성 검사 스키마
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export async function signup(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(values);

  // 유효성 검사 실패 시
  if (!parsed.success) {
    // 필드별 오류를 반환
    return {
      error: {
        fields: parsed.error.flatten().fieldErrors,
      }
    };
  }

  const { name, email, password } = parsed.data;

  try {
    // 이메일 중복 확인
    const existingUser = await db.select().from(member).where(eq(member.email, email)).limit(1);

    if (existingUser.length > 0) {
      return { error: { form: "This email is already in use." } };
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 데이터베이스에 저장
    const userId = uuidv4();
    const now = new Date();

    await db.insert(member).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      createdBy: name,
      updatedBy: name,
    });

    return { success: "Registration completed successfully. You can now sign in." };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: { form: "An unknown error occurred. Please try again." } };
  }
}

export async function login(_prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: "Please enter both email and password." };
    }

    // next-auth의 signIn 함수를 호출하여 로그인 시도
    // 성공 시, 지정된 페이지로 리다이렉트됨
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

    return { success: true };
  } catch (error) {
    // AuthError는 next-auth에서 발생하는 인증 관련 오류
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "An unknown error occurred during sign in." };
      }
    }
    // 다른 종류의 오류는 다시 throw하여 Next.js가 처리하도록 함
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
