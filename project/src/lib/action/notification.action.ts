"use server";

import { requireAdmin } from "../requireAdmin";
import { getSession } from "../session";
import { getPublicErrorMessage } from "../utils/publicError";
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
    return { error: getPublicErrorMessage(error, "Chưa thể tải thông báo. Vui lòng thử lại.") };
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
    return { error: getPublicErrorMessage(error, "Chưa thể cập nhật thông báo. Vui lòng thử lại.") };
  }
}

export async function markAllAdminNotificationsAsReadAction() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  try {
    const result = await NotificationService.markAllAsRead(admin.adminId);
    return { success: true, data: result };
  } catch (error) {
    return { error: getPublicErrorMessage(error, "Chưa thể cập nhật thông báo. Vui lòng thử lại.") };
  }
}

export async function getUserNotificationsAction(
  params: Partial<GetAdminNotificationsParams> = {},
) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    return { error: "Bạn chưa đăng nhập" };
  }

  const parsed = getAdminNotificationsSchema.safeParse(params);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const result = await NotificationService.getAdminNotifications(
      session.sub,
      parsed.data,
    );
    return { success: true, ...result };
  } catch (error) {
    return { error: getPublicErrorMessage(error, "Chưa thể tải thông báo. Vui lòng thử lại.") };
  }
}

export async function markUserNotificationAsReadAction(notificationId: string) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    return { error: "Bạn chưa đăng nhập" };
  }

  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const notification = await NotificationService.markAsRead(
      session.sub,
      parsed.data,
    );
    return { success: true, data: notification };
  } catch (error) {
    return { error: getPublicErrorMessage(error, "Chưa thể cập nhật thông báo. Vui lòng thử lại.") };
  }
}

export async function markAllUserNotificationsAsReadAction() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    return { error: "Bạn chưa đăng nhập" };
  }

  try {
    const result = await NotificationService.markAllAsRead(session.sub);
    return { success: true, data: result };
  } catch (error) {
    return { error: getPublicErrorMessage(error, "Chưa thể cập nhật thông báo. Vui lòng thử lại.") };
  }
}
