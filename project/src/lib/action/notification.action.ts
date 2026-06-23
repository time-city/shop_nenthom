"use server";

import { requireAdmin } from "../requireAdmin";
import { NotificationService } from "../services/notification.service";
import {
  getAdminNotificationsSchema,
  notificationIdSchema,
  type GetAdminNotificationsParams,
} from "../validations/notification.schema";

export async function getAdminNotificationsAction(
  params: Partial<GetAdminNotificationsParams> = {},
) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const parsed = getAdminNotificationsSchema.safeParse(params);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const result = await NotificationService.getAdminNotifications(
      admin.adminId,
      parsed.data,
    );
    return { success: true, ...result };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function markAdminNotificationAsReadAction(notificationId: string) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const notification = await NotificationService.markAsRead(
      admin.adminId,
      parsed.data,
    );
    return { success: true, data: notification };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function markAllAdminNotificationsAsReadAction() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  try {
    const result = await NotificationService.markAllAsRead(admin.adminId);
    return { success: true, data: result };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
