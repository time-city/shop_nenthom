import "server-only";

import prisma from "../prisma";
import { ADMIN_ORDER_EVENT_CHANNEL } from "./adminOrderEvents";

export type CartProductsRemovedEvent = {
  data: {
    productNames: string[];
    userId: string;
  };
  event: "CART_PRODUCTS_REMOVED";
};

export async function emitCartProductsRemovedToUser(
  userId: string,
  productNames: string[],
) {
  if (productNames.length === 0) return;

  const event: CartProductsRemovedEvent = {
    data: {
      productNames,
      userId,
    },
    event: "CART_PRODUCTS_REMOVED",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;
}
