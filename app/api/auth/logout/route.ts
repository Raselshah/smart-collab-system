import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: "auth-token",
    path: "/",
  });

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
