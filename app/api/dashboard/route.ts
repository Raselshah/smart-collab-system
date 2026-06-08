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

    // Get all projects (admin sees all, others see their projects)
    const projects = await prisma.project.findMany({
      where:
        user.role === "ADMIN"
          ? {}
          : {
              OR: [
                { ownerId: user.userId },
                { members: { some: { userId: user.userId } } },
              ],
            },
      include: {
        tasks: true,
      },
    });

    // Calculate stats
    const totalProjects = projects.length;
    const allTasks = projects.flatMap((p) => p.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === "COMPLETED",
    ).length;
    const pendingTasks = allTasks.filter(
      (t) => t.status !== "COMPLETED",
    ).length;
    const overdueTasks = allTasks.filter(
      (t) => t.status !== "COMPLETED" && new Date(t.dueDate) < new Date(),
    ).length;

    // Task status distribution
    const taskStatusDistribution = {
      todo: allTasks.filter((t) => t.status === "TODO").length,
      inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: completedTasks,
    };

    // Priority breakdown
    const priorityBreakdown = {
      high: allTasks.filter((t) => t.priority === "HIGH").length,
      medium: allTasks.filter((t) => t.priority === "MEDIUM").length,
      low: allTasks.filter((t) => t.priority === "LOW").length,
    };

    // Project progress
    const projectProgress = projects.map((project) => ({
      name: project.name,
      progress:
        project.tasks.length > 0
          ? (project.tasks.filter((t) => t.status === "COMPLETED").length /
              project.tasks.length) *
            100
          : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        taskStatusDistribution,
        priorityBreakdown,
        projectProgress,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
