import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { emitOrderStatusUpdatedToUser } from "@/src/lib/events/userOrderEvents";

export async function GET() {
  try {
    const orders = await prisma.order.findMany();
    let count = 0;

    for (const order of orders) {
      // Update to PROCESSING in DB
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
        }
      });

      // Emit event
      await emitOrderStatusUpdatedToUser({
        orderId: order.id,
        orderNumber: order.order_number,
        status: "processing",
        updatedAt: new Date().toISOString(),
        userId: order.user_id || undefined,
      });

      count++;
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${count} đơn hàng sang Đang xử lý và kích hoạt Pusher Realtime`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
