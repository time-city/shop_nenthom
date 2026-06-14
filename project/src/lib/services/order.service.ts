import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "../types/admin";
import prisma from "../prisma";
import type { GetListOrdersParams } from "../validations/order.schema";

const orderStatusMap: Record<OrderStatus, AdminOrderStatus> = {
  CANCELLED: "cancelled",
  DELIVERED: "completed",
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipping",
};

const paymentStatusMap: Record<PaymentStatus, AdminPaymentStatus> = {
  FAILED: "unpaid",
  PAID: "paid",
  UNPAID: "unpaid",
};

export const OrderService = {
  async getListOrder(params: GetListOrdersParams) {
    const { limit, page, search, status } = params;
    const skip = (page - 1) * limit;
    const keyword = search?.trim();

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(keyword && {
        OR: [
          { order_number: { contains: keyword, mode: "insensitive" } },
          { shipping_fullname: { contains: keyword, mode: "insensitive" } },
          { guest_email: { contains: keyword, mode: "insensitive" } },
          { guest_phone: { contains: keyword, mode: "insensitive" } },
        ],
      }),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          created_at: true,
          id: true,
          order_number: true,
          payment_status: true,
          shipping_fullname: true,
          status: true,
          total_cents: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const data: AdminOrder[] = orders.map((order) => ({
      customer: order.shipping_fullname,
      date: order.created_at.toISOString(),
      id: order.order_number || order.id,
      payment: paymentStatusMap[order.payment_status],
      status: orderStatusMap[order.status],
      total: order.total_cents,
    }));

    return {
      data,
      meta: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
