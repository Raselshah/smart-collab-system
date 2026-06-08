import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Fetch recent activities based on user role
    let activities;

    if (user.role === "ADMIN") {
      // Admins see all activities
      activities = await prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    } else {
      // Project Managers and Team Members see activities from their projects
      const userProjects = await prisma.projectMember.findMany({
        where: { userId: user.userId },
        select: { projectId: true },
      });

      const projectIds = userProjects.map((p) => p.projectId);

      // Also include projects owned by the user
      const ownedProjects = await prisma.project.findMany({
        where: { ownerId: user.userId },
        select: { id: true },
      });

      const allProjectIds = [
        ...new Set([...projectIds, ...ownedProjects.map((p) => p.id)]),
      ];

      activities = await prisma.activityLog.findMany({
        where: {
          OR: [{ userId: user.userId }, { projectId: { in: allProjectIds } }],
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
