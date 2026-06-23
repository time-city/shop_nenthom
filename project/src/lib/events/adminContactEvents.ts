import "server-only";

import { ContactStatus } from "@prisma/client";
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
  const pendingContactCount = await prisma.contact.count({
    where: { status: ContactStatus.PENDING },
  });

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
