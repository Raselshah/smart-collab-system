import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { logActivity } from "@/app/services/activityService";
import { createNotification } from "@/app/services/notificationService";
import { taskSchema, validateDueDate } from "@/app/utils/validation";
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
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const overdue = searchParams.get("overdue") === "true";
    const upcoming = searchParams.get("upcoming") === "true";

    let where: any = {};

    if (user.role !== "ADMIN") {
      where = {
        OR: [
          { project: { ownerId: user.userId } },
          { project: { members: { some: { userId: user.userId } } } },
          { assignedTo: user.userId },
        ],
      };
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: "COMPLETED" };
    }

    if (upcoming) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.dueDate = { gte: new Date(), lte: nextWeek };
      where.status = { not: "COMPLETED" };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validation = taskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    // Check for duplicate task title in same project
    const existingTask = await prisma.task.findFirst({
      where: {
        projectId: validation.data.projectId,
        title: validation.data.title,
      },
    });

    if (existingTask) {
      return NextResponse.json(
        { success: false, error: "Task already exists in this project." },
        { status: 400 },
      );
    }

    // Validate due date
    if (!validateDueDate(validation.data.dueDate)) {
      return NextResponse.json(
        { success: false, error: "Invalid due date selected." },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        projectId: validation.data.projectId,
        assignedTo: validation.data.assignedTo,
        dueDate: validation.data.dueDate,
        priority: validation.data.priority,
        status: validation.data.status,
      },
      include: {
        project: {
          select: { name: true, ownerId: true },
        },
        assignedUser: {
          select: { name: true, email: true },
        },
      },
    });

    // Log activity
    await logActivity(
      user.userId,
      "TASK_CREATED",
      `Created task "${task.title}" in project "${task.project.name}"`,
      task.projectId,
      task.id,
    );

    // Notify assigned user
    if (validation.data.assignedTo) {
      await createNotification(
        validation.data.assignedTo,
        "New Task Assigned",
        `You have been assigned to task: ${task.title}`,
        "TASK_ASSIGNED",
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
