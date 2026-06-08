import { getCurrentUser, getSession } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user) {
      return NextResponse.json({ authenticated: true, user });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const refreshedUser = await getCurrentUser();
    return NextResponse.json({ authenticated: true, user: refreshedUser });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
