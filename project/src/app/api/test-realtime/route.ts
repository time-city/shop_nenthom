import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { emitOrderStatusUpdatedToUser } from "@/src/lib/events/userOrderEvents";
import PusherClient from "pusher-js";

export async function GET(req: Request) {
  try {
    const order = await prisma.order.findFirst({
      where: { user_id: { not: null } }
    });

    if (!order) return NextResponse.json({ error: "No order with user_id found" });

    // Server-side emit
    await emitOrderStatusUpdatedToUser({
      orderId: order.id,
      orderNumber: order.order_number,
      status: "delivered",
      updatedAt: new Date().toISOString(),
      userId: order.user_id || undefined,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Triggered Pusher event for order ${order.order_number}, user ${order.user_id}`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
