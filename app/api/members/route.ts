import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 5; // 페이지당 5건
  const offset = (page - 1) * limit;

  try {
    // 전체 사용자 수 조회
    const totalUsersResult = await db.select({ count: count() }).from(member);
    const totalUsers = totalUsersResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);

    // 페이징된 사용자 목록 조회
    const userList = await db.select({
      id: member.id,
      name: member.name,
      email: member.email,
      createdAt: member.createdAt,
    }).from(member)
      .orderBy(member.createdAt)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      users: userList,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error("Member list error:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}
