"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

// Zod를 사용한 입력 데이터 유효성 검사 스키마
const signupSchema = z.object({
  name: z.string().min(2, { message: "이름은 2자 이상이어야 합니다." }),
  email: z.string().email({ message: "유효한 이메일을 입력해주세요." }),
  password: z.string().min(6, { message: "비밀번호는 6자 이상이어야 합니다." }),
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
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: { form: "이미 사용중인 이메일입니다." } };
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 데이터베이스에 저장
    await db.insert(users).values({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
    });

    return { success: "회원가입이 완료되었습니다. 이제 로그인할 수 있습니다." };
  } catch (error) {
    console.error(error);
    return { error: { form: "알 수 없는 오류가 발생했습니다. 다시 시도해주세요." } };
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "이메일과 비밀번호를 모두 입력해주세요." };
    }

    // next-auth의 signIn 함수를 호출하여 로그인 시도
    // 성공 시, 지정된 페이지로 리다이렉트됨
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

  } catch (error) {
    // AuthError는 next-auth에서 발생하는 인증 관련 오류
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
        default:
          return { error: "로그인 중 알 수 없는 오류가 발생했습니다." };
      }
    }
    // 다른 종류의 오류는 다시 throw하여 Next.js가 처리하도록 함
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
