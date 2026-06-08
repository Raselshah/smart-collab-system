import { requireAuth } from "@/app/lib/auth";
import { logger } from "@/app/lib/logger";
import prisma from "@/app/lib/prisma";
import { ApiResponse } from "@/app/lib/response";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignee: true,
            comments: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        creator: true,
        activities: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return ApiResponse.notFound("Project");
    }

    if (user.role !== "ADMIN" && project.createdBy !== user.id) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: id, userId: user.id },
      });
      if (!isMember) {
        return ApiResponse.forbidden();
      }
    }

    const projectWithStats = {
      ...project,
      progress:
        project.tasks.length > 0
          ? Math.round(
              (project.tasks.filter((t) => t.status === "COMPLETED").length /
                project.tasks.length) *
                100,
            )
          : 0,
      taskStats: {
        total: project.tasks.length,
        completed: project.tasks.filter((t) => t.status === "COMPLETED").length,
        inProgress: project.tasks.filter((t) => t.status === "IN_PROGRESS")
          .length,
        todo: project.tasks.filter((t) => t.status === "TODO").length,
        review: project.tasks.filter((t) => t.status === "REVIEW").length,
      },
    };

    return ApiResponse.success(projectWithStats);
  } catch (error: any) {
    logger.error("Error fetching project:", error);
    if (error.message === "UNAUTHORIZED") return ApiResponse.unauthorized();
    return ApiResponse.error("Internal server error", 500);
  }
}
