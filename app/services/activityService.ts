import prisma from "@/app/lib/prisma";

type LogActivityParams = {
  userId: string;
  action: string;
  details: string;
  projectId?: string;
  taskId?: string;
};

export async function logActivity({
  userId,
  action,
  details,
  projectId,
  taskId,
}: LogActivityParams) {
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
