import { z } from "zod";

export const getAdminNotificationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  unreadOnly: z.boolean().default(false),
});

export const notificationIdSchema = z.string().uuid(
  "ID thông báo không hợp lệ",
);

export type GetAdminNotificationsParams = z.infer<
  typeof getAdminNotificationsSchema
>;
