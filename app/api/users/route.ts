import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
