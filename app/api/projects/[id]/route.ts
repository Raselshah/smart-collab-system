import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { logActivity } from "@/app/services/activityService";
import { createNotification } from "@/app/services/notificationService";
import { projectSchema } from "@/app/utils/validation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/projects/[id] - Get single project by ID
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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    // Check if user has access to this project
    const isOwner = project.ownerId === user.userId;
    const isMember = project.members.some(
      (member) => member.userId === user.userId,
    );
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isMember && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
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

    // Check if project exists and user has permission
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const isOwner = existingProject.ownerId === user.userId;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only edit your own projects",
        },
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

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: {
        name: validation.data.name,
        description: validation.data.description,
        deadline: validation.data.deadline,
        status: validation.data.status,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "PROJECT_UPDATED",
      details: `Updated project "${updatedProject.name}"`,
      projectId: updatedProject.id,
    });

    // Notify project members about update
    const memberIds = updatedProject.members.map((m) => m.userId);
    for (const memberId of memberIds) {
      if (memberId !== user.userId) {
        await createNotification({
          userId: memberId,
          title: "Project Updated",
          message: `${user.email} updated project "${updatedProject.name}"`,
          type: "PROJECT_UPDATED",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id] - Delete project
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

    // Check if project exists and user has permission
    const existingProject = await prisma.project.findUnique({
      where: { id: id },
      include: {
        tasks: true,
        members: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const isOwner = existingProject.ownerId === user.userId;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only delete your own projects",
        },
        { status: 403 },
      );
    }

    const projectName = existingProject.name;

    // Delete project (cascade will handle related records based on schema)
    await prisma.project.delete({
      where: { id: id },
    });

    // Log activity
    await logActivity({
      userId: user.userId,
      action: "PROJECT_DELETED",
      details: `Deleted project "${projectName}"`,
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
