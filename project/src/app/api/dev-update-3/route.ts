import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { emitOrderStatusUpdatedToUser } from "@/src/lib/events/userOrderEvents";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("order_number");
  if (!orderNumber) return NextResponse.json({ error: "No order_number" });

  try {
    const order = await prisma.order.findUnique({
      where: { order_number: orderNumber }
    });
    if (!order) return NextResponse.json({ error: "Not found" });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "DELIVERED",
        history_logs: {
          create: {
            current_status: "DELIVERED",
            previous_status: order.status,
            note: "TEST: Tự động chuyển sang Giao hàng thành công",
          }
        }
      }
    });

    const statusPayload = {
      orderId: updated.id,
      orderNumber: updated.order_number,
      status: "delivered" as const,
      updatedAt: new Date().toISOString(),
      userId: updated.user_id || undefined,
    };
    await emitOrderStatusUpdatedToUser(statusPayload);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack });
  }
}
