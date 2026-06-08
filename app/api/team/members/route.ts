import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/team/members - Get all team members with workload
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
    const projectId = searchParams.get("projectId");

    let users;
    if (projectId) {
      // Get members of specific project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
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
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
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

      users = [
        { ...project.owner, role: "OWNER", isOwner: true },
        ...project.members.map((m) => ({ ...m.user, isOwner: false })),
      ];
    } else {
      // Get all users
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      });
    }

    // Get workload for each user
    const usersWithWorkload = await Promise.all(
      users.map(async (u: any) => {
        const tasks = await prisma.task.findMany({
          where: { assignedTo: u.id },
          include: {
            project: {
              select: { name: true },
            },
          },
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(
          (t) => t.status === "COMPLETED",
        ).length;
        const inProgressTasks = tasks.filter(
          (t) => t.status === "IN_PROGRESS",
        ).length;
        const todoTasks = tasks.filter((t) => t.status === "TODO").length;
        const overdueTasks = tasks.filter(
          (t) => t.status !== "COMPLETED" && new Date(t.dueDate) < new Date(),
        ).length;

        // Get recent tasks
        const recentTasks = tasks
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        return {
          ...u,
          workload: {
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            overdueTasks,
            completionRate:
              totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          },
          recentTasks,
        };
      }),
    );

    return NextResponse.json({ success: true, data: usersWithWorkload });
  } catch (error) {
    console.error("Get team members error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
