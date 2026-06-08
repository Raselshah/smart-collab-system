import { hashPassword, requireRole } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await requireRole(["ADMIN", "PROJECT_MANAGER"]);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      assignedTasks: {
        include: { project: true },
      },
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  const { name, email, role, password = "default123" } = await req.json();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.activity.create({
    data: {
      action: "MEMBER_ADDED",
      details: `Team member ${name} added`,
      userId: session.userId,
    },
  });

  return NextResponse.json(user);
}
