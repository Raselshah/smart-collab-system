import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { logActivity } from "@/app/services/activityService";
import { createNotification } from "@/app/services/notificationService";
import { taskSchema, validateDueDate } from "@/app/utils/validation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tasks/[id] - Get single task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            members: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );
    }

    // Check access
    const hasAccess =
      user.role === "ADMIN" ||
      task.project.ownerId === user.userId ||
      task.assignedTo === user.userId ||
      task.project.members.some((m) => m.user.id === user.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/tasks/[id] - Update task completely
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: id },
      include: {
        project: {
          select: { name: true, ownerId: true },
        },
        assignedUser: {
          select: { name: true },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );
    }

    // Check permission
    const canEdit =
      user.role === "ADMIN" ||
      existingTask.project.ownerId === user.userId ||
      user.role === "PROJECT_MANAGER";

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot edit this task" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validation = taskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    // Check for duplicate title if title changed
    if (validation.data.title !== existingTask.title) {
      const duplicateTask = await prisma.task.findFirst({
        where: {
          projectId: validation.data.projectId,
          title: validation.data.title,
          id: { not: id },
        },
      });

      if (duplicateTask) {
        return NextResponse.json(
          { success: false, error: "Task already exists in this project." },
          { status: 400 },
        );
      }
    }

    // Validate due date
    if (!validateDueDate(new Date(validation.data.dueDate))) {
      return NextResponse.json(
        { success: false, error: "Invalid due date selected." },
        { status: 400 },
      );
    }

    // Check if trying to reassign completed task
    if (
      existingTask.status === "COMPLETED" &&
      validation.data.assignedTo !== existingTask.assignedTo
    ) {
      return NextResponse.json(
        { success: false, error: "Completed tasks cannot be reassigned." },
        { status: 400 },
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        projectId: validation.data.projectId,
        assignedTo: validation.data.assignedTo,
        dueDate: new Date(validation.data.dueDate),
        priority: validation.data.priority,
        status: validation.data.status,
      },
      include: {
        project: {
          select: { name: true },
        },
        assignedUser: {
          select: { name: true, email: true },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "TASK_UPDATED",
      details: `Updated task "${updatedTask.title}"`,
      projectId: updatedTask.projectId,
      taskId: updatedTask.id,
    });

    // Notify if assigned user changed
    if (
      validation.data.assignedTo &&
      validation.data.assignedTo !== existingTask.assignedTo
    ) {
      await createNotification({
        userId: validation.data.assignedTo,
        title: "Task Reassigned",
        message: `Task "${updatedTask.title}" has been reassigned to you`,
        type: "TASK_UPDATED",
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/tasks/[id] - Partially update task (for status updates)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
      include: {
        project: {
          select: { name: true, ownerId: true },
        },
        assignedUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );
    }

    // Check permission for partial updates
    const canUpdate =
      user.role === "ADMIN" ||
      existingTask.project.ownerId === user.userId ||
      existingTask.assignedTo === user.userId ||
      user.role === "PROJECT_MANAGER";

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot update this task" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { status, priority, dueDate, assignedTo } = body;

    const updateData: any = {};
    let statusChanged = false;
    let wasCompleted = false;

    if (status && status !== existingTask.status) {
      updateData.status = status;
      statusChanged = true;
      if (status === "COMPLETED") {
        wasCompleted = true;
      }
    }
    if (priority) updateData.priority = priority;
    if (dueDate) {
      const newDueDate = new Date(dueDate);
      if (!validateDueDate(newDueDate)) {
        return NextResponse.json(
          { success: false, error: "Invalid due date selected." },
          { status: 400 },
        );
      }
      updateData.dueDate = newDueDate;
    }

    // Check if trying to reassign completed task
    if (
      assignedTo &&
      existingTask.status === "COMPLETED" &&
      assignedTo !== existingTask.assignedTo
    ) {
      return NextResponse.json(
        { success: false, error: "Completed tasks cannot be reassigned." },
        { status: 400 },
      );
    }
    if (assignedTo) updateData.assignedTo = assignedTo;

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: updateData,
      include: {
        project: {
          select: { name: true },
        },
        assignedUser: {
          select: { name: true, email: true },
        },
      },
    });

    // Log activity based on changes
    if (statusChanged) {
      const statusText =
        status === "COMPLETED"
          ? "completed"
          : status === "IN_PROGRESS"
            ? "started"
            : "updated";
      await logActivity({
        userId: user.userId,
        action: status === "COMPLETED" ? "TASK_COMPLETED" : "TASK_UPDATED",
        details: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} task "${updatedTask.title}"`,
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
      });

      // Notify project owner about completion
      if (
        status === "COMPLETED" &&
        existingTask.project.ownerId !== user.userId
      ) {
        await createNotification({
          userId: existingTask.project.ownerId,
          title: "Task Completed",
          message: `${user.email} completed task "${updatedTask.title}" in project ${updatedTask.project.name}`,
          type: "TASK_COMPLETED",
        });
      }
    } else {
      await logActivity({
        userId: user.userId,
        action: "TASK_UPDATED",
        details: `Updated task "${updatedTask.title}"`,
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
      });
    }

    // Notify if assigned user changed
    if (assignedTo && assignedTo !== existingTask.assignedTo) {
      await createNotification({
        userId: assignedTo,
        title: "Task Assigned",
        message: `You have been assigned to task "${updatedTask.title}" in project ${updatedTask.project.name}`,
        type: "TASK_ASSIGNED",
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Patch task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
      include: {
        project: {
          select: { name: true, ownerId: true },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 },
      );
    }

    // Check permission
    const canDelete =
      user.role === "ADMIN" ||
      existingTask.project.ownerId === user.userId ||
      user.role === "PROJECT_MANAGER";

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot delete this task" },
        { status: 403 },
      );
    }

    const taskTitle = existingTask.title;

    await prisma.task.delete({
      where: { id: id },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "TASK_DELETED",
      details: `Deleted task "${taskTitle}"`,
      projectId: existingTask.projectId,
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
