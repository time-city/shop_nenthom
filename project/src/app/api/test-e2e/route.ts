import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { OrderService } from "@/src/lib/services/order.service";
import { OrderStatus, Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const user = await prisma.user.findFirst({ where: { role: Role.CUSTOMER } });
    if (!user) return NextResponse.json({ error: "No user found" });

    // 1. Create Order
    const orderNumber = "DH-TEST-" + Math.floor(Math.random() * 100000);
    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user: { connect: { id: user.id } },
        total_cents: 100000,
        status: OrderStatus.PROCESSING,
        shipping_fullname: "Test User",
        shipping_phone: "0123456789",
        shipping_address: "Test address",
        shipping_city: "Test city",
        payment_method: "BANK_TRANSFER",
        subtotal_cents: 100000
      }
    });

    // 2. Test the EXACT code that UpdateTrackingForm calls (OrderService.updateOrderTracking)
    // using the UUID (order.id) as we fixed in detailOrderAdmin.tsx
    const updated = await OrderService.updateOrderTracking(
      { order_id: order.id, shipping_carrier: "SPX", tracking_code: "TEST-TRACKING" },
      "test-admin"
    );

    return NextResponse.json({ 
      success: true, 
      message: "Order created and updated successfully!",
      createdOrder: order,
      updatedOrder: updated
    });
  } catch (error: any) {
    console.error("Test e2e error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
