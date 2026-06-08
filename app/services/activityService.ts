import prisma from "../lib/prisma";

export async function logActivity(
  userId: string,
  action: string,
  details: string,
  projectId?: string,
  taskId?: string,
) {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      details,
      projectId,
      taskId,
    },
  });
}

export async function getRecentActivities(limit: number = 10) {
  return prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          name: true,
        },
      },
      task: {
        select: {
          title: true,
        },
      },
    },
  });
}
