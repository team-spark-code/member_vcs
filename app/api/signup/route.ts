import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, passwordConfirm, address, zipcode } = await request.json();

    // 필수 입력값 검증
    if (!name || !email || !password || !passwordConfirm) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    // 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    // 중복 확인 (이름 또는 이메일)
    const existingUser = await db.select().from(member).where(
      or(eq(member.name, name), eq(member.email, email))
    ).limit(1);

    if (existingUser.length > 0) {
      if (existingUser[0].name === name) {
        return NextResponse.json({ error: "This name is already taken." }, { status: 400 });
      }
      if (existingUser[0].email === email) {
        return NextResponse.json({ error: "This email is already in use." }, { status: 400 });
      }
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const userId = uuidv4();
    const now = new Date();

    await db.insert(member).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      address: address || null,
      postalCode: zipcode || null,
      createdAt: now,
      updatedAt: now,
      createdBy: name, // 가입시에는 본인이 만든사람
      updatedBy: name, // 가입시에는 본인이 수정한사람
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully."
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}
