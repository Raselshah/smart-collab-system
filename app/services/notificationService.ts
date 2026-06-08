import prisma from "../lib/prisma";

type CreateNotificationParams = {
  userId: string;
  title: string;
  message: string;
  type: string;
};

export async function createNotification({
  userId,
  title,
  message,
  type,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });
}
