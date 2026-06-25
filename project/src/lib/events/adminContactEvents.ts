import "server-only";

import { ContactStatus, NotificationType, Role, UserStatus } from "@prisma/client";
import prisma from "../prisma";
import { ADMIN_ORDER_EVENT_CHANNEL } from "./adminOrderEvents";

export type NewContactAdminPayload = {
  contactId: string;
  createdAt: string;
  email: string;
  name: string;
  pendingContactCount: number;
  status: "PENDING";
  subject: string;
};

export type NewContactAdminEvent = {
  data: NewContactAdminPayload;
  event: "NEW_CONTACT";
};

type EmitNewContactToAdminInput = Omit<
  NewContactAdminPayload,
  "pendingContactCount" | "status"
>;

export async function emitNewContactToAdmin(
  input: EmitNewContactToAdminInput,
) {
  const contactCreatedAt = new Date(input.createdAt);
  const notificationData = {
    contactId: input.contactId,
    createdAt: input.createdAt,
    email: input.email,
    name: input.name,
    subject: input.subject,
  };

  const [pendingContactCount, admins] = await Promise.all([
    prisma.contact.count({
      where: { status: ContactStatus.PENDING },
    }),
    prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    }),
  ]);

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        created_at: contactCreatedAt,
        data: notificationData,
        message: `${input.name} vừa gửi yêu cầu hỗ trợ: ${input.subject}`,
        title: "Có yêu cầu hỗ trợ mới",
        type: NotificationType.NEW_CONTACT,
        user_id: admin.id,
      })),
      skipDuplicates: true,
    });
  }

  const event: NewContactAdminEvent = {
    data: {
      ...input,
      pendingContactCount,
      status: "PENDING",
    },
    event: "NEW_CONTACT",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;

  return event;
}
