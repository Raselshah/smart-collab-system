import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { logActivity } from "@/app/services/activityService";
import { createNotification } from "@/app/services/notificationService";
import { projectSchema } from "@/app/utils/validation";
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "PROJECT_MANAGER")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        name: validation.data.name,
        description: validation.data.description,
        deadline: validation.data.deadline,
        status: validation.data.status,
        ownerId: user.userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        tasks: true,
      },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "PROJECT_CREATED",
      details: `Created project "${project.name}"`,
    });

    // Notify admin about new project
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "New Project Created",
        message: `${user.email} created a new project: ${project.name}`,
        type: "PROJECT_CREATED",
      });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
