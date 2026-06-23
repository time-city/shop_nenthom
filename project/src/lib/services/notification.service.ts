import prisma from "../prisma";
import type { GetAdminNotificationsParams } from "../validations/notification.schema";

export const NotificationService = {
  async getAdminNotifications(
    adminId: string,
    params: GetAdminNotificationsParams,
  ) {
    const where = {
      user_id: adminId,
      ...(params.unreadOnly ? { is_read: false } : {}),
    };
    const skip = (params.page - 1) * params.limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: params.limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { user_id: adminId, is_read: false },
      }),
    ]);

    return {
      data: notifications,
      meta: {
        limit: params.limit,
        page: params.page,
        total,
        totalPages: Math.ceil(total / params.limit),
        unreadCount,
      },
    };
  },

  async markAsRead(adminId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, user_id: adminId },
      select: { id: true, is_read: true },
    });

    if (!notification) throw new Error("Thông báo không tồn tại");
    if (notification.is_read) {
      return prisma.notification.findUniqueOrThrow({
        where: { id: notification.id },
      });
    }

    return prisma.notification.update({
      where: { id: notification.id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  },

  async markAllAsRead(adminId: string) {
    const result = await prisma.notification.updateMany({
      where: { user_id: adminId, is_read: false },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { updatedCount: result.count };
  },
};
