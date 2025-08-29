import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const value = searchParams.get("value");

  if (!type || !value) {
    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  }

  try {
    let existingUser;

    if (type === "name") {
      existingUser = await db.select().from(member).where(eq(member.name, value)).limit(1);
    } else if (type === "email") {
      existingUser = await db.select().from(member).where(eq(member.email, value)).limit(1);
    } else {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    return NextResponse.json({ duplicate: existingUser.length > 0 });
  } catch (error) {
    console.error("Duplicate check error:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}
