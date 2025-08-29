import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// 사용자 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const user = await db.select({
      id: member.id,
      name: member.name,
      email: member.email,
      address: member.address,
      postalCode: member.postalCode,
    }).from(member).where(eq(member.id, id)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("User info retrieval error:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}

// 사용자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { name, email, password, address, postalCode } = await request.json();

    // 필수 입력값 검증
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // 현재 사용자 정보 조회
    const currentUser = await db.select().from(member).where(eq(member.id, id)).limit(1);
    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      name,
      email,
      address: address || null,
      postalCode: postalCode || null,
      updatedAt: new Date(),
      updatedBy: name, // 수정한 사람은 본인
    };

    // 비밀번호가 제공된 경우 해싱
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 사용자 정보 업데이트
    await db.update(member).set(updateData).where(eq(member.id, id));

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully."
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}
