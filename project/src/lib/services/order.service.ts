import { DiscountType, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import type { AdminOrder } from "../types/admin";
import { sendOrderBillEmail } from "../mailer";
import prisma from "../prisma";
import { clientOrderStatusMap, orderStatusMap, paymentStatusMap } from "../types/order";
import type {
 CreateOrderInput,
 GetListOrdersParams,
 UpdateOrderStatusInput,
} from "../validations/order.schema";


const shippingFeeCents = 0;


// Chuẩn hóa topping_json về danh sách id số để tính giá và hiển thị option.
const getToppingIds = (value: unknown) =>
 Array.isArray(value)
   ? value.filter((id): id is number => Number.isInteger(id))
   : [];


// Sinh mã đơn ngắn để khách hàng/admin dễ tra cứu.
const createOrderNumber = () => `CC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;


// Chuẩn hóa mã giảm giá trước khi so sánh với dữ liệu trong DB.
function normalizeDiscountCode(code: string) {
 return code.trim().toUpperCase();
}


function isUuid(value: string) {
 return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}


type OrderDetailViewer = {
 role: "ADMIN" | "CUSTOMER";
 userId?: string;
};


export const OrderService = {
 // Tạo đơn hàng từ cart item đã chọn, tự tính giá từ DB, áp dụng mã giảm giá cho user đăng nhập và gửi bill qua email.
 async createOrder(data: CreateOrderInput, userId?: string, sessionId?: string) {
   if (!userId && !sessionId) {
     throw new Error("Phiên mua sắm đã hết hạn. Vui lòng tải lại trang và thử lại.");
   }


   if (!userId && !data.guest_email) {
     throw new Error("Vui lòng nhập email để nhận thông tin đơn hàng.");
   }


   if (!userId && data.discount_code) {
     throw new Error("Vui lòng đăng nhập để sử dụng mã giảm giá.");
   }


   const user = userId
     ? await prisma.user.findUnique({
       where: { id: userId },
       select: { email: true },
     })
     : null;
   const billingEmail = user?.email ?? data.guest_email;


   if (!billingEmail) {
     throw new Error("Chưa có email nhận hóa đơn. Vui lòng kiểm tra lại thông tin thanh toán.");
   }


   const cart = await prisma.cart.findFirst({
     where: userId ? { user_id: userId } : { session_id: sessionId },
     select: { id: true },
   });


   if (!cart) {
     throw new Error("Giỏ hàng chưa có sản phẩm nào");
   }


   const cartItems = await prisma.cartItem.findMany({
     where: {
       cart_id: cart.id,
       id: { in: data.cart_item_ids },
     },
     include: {
       color: true,
       packaging: true,
       product: true,
       scent: true,
       size: true,
     },
   });


   if (cartItems.length !== data.cart_item_ids.length) {
     throw new Error("Một số sản phẩm trong giỏ hàng không còn khả dụng. Vui lòng kiểm tra lại giỏ hàng.");
   }


   if (cartItems.length === 0) {
     throw new Error("Vui lòng chọn sản phẩm muốn thanh toán.");
   }


   const toppingIds = [
     ...new Set(cartItems.flatMap((item) => getToppingIds(item.toppings_json))),
   ];
   const toppings = toppingIds.length
     ? await prisma.topping.findMany({
       where: {
         id: { in: toppingIds },
         is_active: true,
         in_stock: true,
       },
       select: {
         id: true,
         name: true,
         price_extra_cents: true,
       },
     })
     : [];
   const toppingById = new Map(toppings.map((topping) => [topping.id, topping]));


   const orderItems = cartItems.map((item) => {
     const itemToppings = getToppingIds(item.toppings_json)
       .map((id) => toppingById.get(id))
       .filter((topping): topping is NonNullable<typeof topping> => Boolean(topping));
     const toppingPrice = itemToppings.reduce(
       (sum, topping) => sum + topping.price_extra_cents,
       0,
     );
     const unitPrice =
       item.product.base_price_cents +
       (item.scent?.price_extra_cents ?? 0) +
       (item.color?.price_extra_cents ?? 0) +
       (item.size?.price_extra_cents ?? 0) +
       (item.packaging?.price_extra_cents ?? 0) +
       toppingPrice;


     return {
       cartItemId: item.id,
       color: item.color?.name,
       name: item.product.name,
       pack: item.packaging?.name,
       price: unitPrice,
       product_id: item.product_id,
       quantity: item.quantity,
       scent: item.scent?.name ?? item.product.name,
       scent_id: item.scent_id,
       color_id: item.color_id,
       size: item.size?.weight_gram
         ? `${item.size.name} (${item.size.weight_gram}g)`
         : item.size?.name ?? "Mặc định",
       size_id: item.size_id,
       pack_id: item.pack_id,
       toppings_json: item.toppings_json ?? [],
     };
   });


   const subtotal = orderItems.reduce(
     (sum, item) => sum + item.price * item.quantity,
     0,
   );
   const discountCode = data.discount_code
     ? normalizeDiscountCode(data.discount_code)
     : undefined;
   const discount = discountCode && userId
     ? await prisma.discountCode.findFirst({
       where: {
         code: { equals: discountCode, mode: "insensitive" },
         is_active: true,
       },
     })
     : null;


   if (discountCode && !discount) {
     throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
   }


   if (discount?.expires_at && discount.expires_at < new Date()) {
     throw new Error("Mã giảm giá đã hết hạn.");
   }


   if (discount && discount.used_count >= discount.max_uses) {
     throw new Error("Mã giảm giá đã hết lượt sử dụng.");
   }


   const discountCents = discount
     ? discount.type === DiscountType.PERCENTAGE
       ? Math.floor((subtotal * discount.discount_amount_cents) / 100)
       : Math.min(discount.discount_amount_cents, subtotal)
     : 0;
   const total = Math.max(subtotal - discountCents, 0) + shippingFeeCents;
   const paymentMethod = data.payment_method as PaymentMethod;


   const order = await prisma.$transaction(async (tx) => {
     const createdOrder = await tx.order.create({
       data: {
         discount_cents: discountCents,
         discount_code_text: discount?.code ?? null,
         guest_email: userId ? null : data.guest_email,
         guest_phone: userId ? null : data.guest_phone ?? data.shipping_phone,
         order_number: createOrderNumber(),
         payment_method: paymentMethod,
         payment_status: PaymentStatus.UNPAID,
         shipping_address: data.shipping_address,
         shipping_cents: shippingFeeCents,
         shipping_city: data.shipping_city,
         shipping_fullname: data.shipping_fullname,
         shipping_note: data.shipping_note || null,
         shipping_phone: data.shipping_phone,
         subtotal_cents: subtotal,
         total_cents: total,
         user_id: userId,
         items: {
           create: orderItems.map((item) => ({
             color_id: item.color_id,
             pack_id: item.pack_id,
             product_id: item.product_id,
             quantity: item.quantity,
             scent_id: item.scent_id,
             size_id: item.size_id,
             toppings_json: item.toppings_json,
             unit_price_cents: item.price,
           })),
         },
         history_logs: {
           create: {
             current_status: OrderStatus.PENDING,
             note: "Đơn hàng mới được tạo",
           },
         },
       },
     });


     await tx.cartItem.deleteMany({
       where: {
         cart_id: cart.id,
         id: { in: data.cart_item_ids },
       },
     });


     if (discount && userId) {
       await tx.discountUsage.create({
         data: {
           discount_code_id: discount.id,
           order_id: createdOrder.id,
           user_id: userId,
         },
       });
       await tx.discountCode.update({
         where: { id: discount.id },
         data: {
           used_count: {
             increment: 1,
           },
         },
       });
     }


     return createdOrder;
   });


   const clientPaymentMethod: "bank" | "cod" =
     data.payment_method === PaymentMethod.BANK_TRANSFER ? "bank" : "cod";


   const orderBill = {
     address: data.shipping_address,
     city: data.shipping_city,
     createdAt: order.created_at.toISOString(),
     email: billingEmail,
     fullname: data.shipping_fullname,
     isGuest: !userId,
     items: orderItems.map((item) => ({
       color: item.color,
       name: item.name,
       pack: item.pack,
       price: item.price,
       quantity: item.quantity,
       scent: item.scent,
       size: item.size,
     })),
     note: data.shipping_note,
     orderId: order.id,
     orderNumber: order.order_number,
     paymentMethod: clientPaymentMethod,
     phone: data.shipping_phone,
     shipping: shippingFeeCents,
     subtotal,
     total,
   };


   await sendOrderBillEmail(orderBill);


   return orderBill;
 },


 // Lấy lịch sử đơn hàng của khách hàng đang đăng nhập để hiển thị phía client.
 async getMyOrders(userId: string) {
   const orders = await prisma.order.findMany({
     where: { user_id: userId },
     orderBy: { created_at: "desc" },
     include: {
       items: {
         include: {
           color: true,
           packaging: true,
           product: true,
           scent: true,
           size: true,
         },
       },
     },
   });


   const toppingIds = [
     ...new Set(orders.flatMap((order) =>
       order.items.flatMap((item) => getToppingIds(item.toppings_json)),
     )),
   ];
   const toppings = toppingIds.length
     ? await prisma.topping.findMany({
       where: { id: { in: toppingIds } },
       select: { id: true, name: true },
     })
     : [];
   const toppingById = new Map(toppings.map((topping) => [topping.id, topping.name]));


   return orders.map((order) => ({
     date: order.created_at.toLocaleDateString("vi-VN"),
     id: order.order_number,
     items: order.items.map((item) => {
       const optionText = [
         item.scent?.name,
         item.size?.weight_gram
           ? `${item.size.name} (${item.size.weight_gram}g)`
           : item.size?.name,
         item.color?.name,
         item.packaging?.name,
         ...getToppingIds(item.toppings_json)
           .map((id) => toppingById.get(id))
           .filter((name): name is string => Boolean(name)),
       ].filter(Boolean).join(", ");


       return {
         detail: optionText || undefined,
         name: item.product.name,
         price: item.unit_price_cents,
         quantity: item.quantity,
       };
     }),
     status: clientOrderStatusMap[order.status],
     total: order.total_cents,
   }));
 },


 // Lấy chi tiết đơn hàng dùng chung: customer bị ràng buộc user_id, admin được xem mọi đơn.
 async getOrderDetail(orderId: string, viewer: OrderDetailViewer) {
   const order = await prisma.order.findFirst({
     where: {
       OR: [
         ...(isUuid(orderId) ? [{ id: orderId }] : []),
         { order_number: orderId },
       ],
       ...(viewer.role !== "ADMIN" && { user_id: viewer.userId }),
     },
     include: {
       history_logs: {
         include: {
           admin: {
             select: {
               fullname: true,
               id: true,
             },
           },
         },
         orderBy: { created_at: "asc" },
       },
       items: {
         include: {
           color: true,
           packaging: true,
           product: true,
           scent: true,
           size: true,
         },
       },
       user: {
         select: {
           email: true,
         },
       },
     },
   });


   if (!order) {
     return null;
   }


   const toppingIds = [
     ...new Set(order.items.flatMap((item) => getToppingIds(item.toppings_json))),
   ];
   const toppings = toppingIds.length
     ? await prisma.topping.findMany({
       where: { id: { in: toppingIds } },
       select: { id: true, name: true },
     })
     : [];
   const toppingById = new Map(toppings.map((topping) => [topping.id, topping.name]));
   const clientPaymentMethod: "bank" | "cod" =
     order.payment_method === PaymentMethod.BANK_TRANSFER ? "bank" : "cod";
   const clientPaymentStatus: "paid" | "unpaid" =
     order.payment_status === PaymentStatus.PAID ? "paid" : "unpaid";


   return {
     date: order.created_at.toLocaleDateString("vi-VN"),
     discount: order.discount_cents,
     email: order.user?.email ?? order.guest_email,
     id: order.order_number,
     items: order.items.map((item) => {
       const optionText = [
         item.scent?.name,
         item.size?.weight_gram
           ? `${item.size.name} (${item.size.weight_gram}g)`
           : item.size?.name,
         item.color?.name,
         item.packaging?.name,
         ...getToppingIds(item.toppings_json)
           .map((id) => toppingById.get(id))
           .filter((name): name is string => Boolean(name)),
       ].filter(Boolean).join(", ");


       return {
         detail: optionText || undefined,
         name: item.product.name,
         price: item.unit_price_cents,
         quantity: item.quantity,
         toppings: getToppingIds(item.toppings_json)
           .map((id) => toppingById.get(id))
           .filter((name): name is string => Boolean(name)),
         scent: item.scent?.name || undefined,
         colorName: item.color?.name || undefined,
         colorHex: item.color?.hex_code || undefined,
         size: item.size?.weight_gram
           ? `${item.size.name} (${item.size.weight_gram}g)`
           : (item.size?.name || undefined),
       };
     }),
     discountCode: order.discount_code_text,
     historyLogs: order.history_logs.map((log) => ({
       admin: log.admin?.fullname ?? null,
       createdAt: log.created_at.toISOString(),
       currentStatus: log.current_status,
       id: log.id,
       note: log.note,
       previousStatus: log.previous_status,
       updatedBy: log.updated_by,
     })),
     paymentMethod: clientPaymentMethod,
     paymentStatus: clientPaymentStatus,
     phone: order.shipping_phone,
     shipping: order.shipping_cents,
     shippingAddress: order.shipping_address,
     shippingCity: order.shipping_city,
     shippingFullname: order.shipping_fullname,
     shippingNote: order.shipping_note,
     status: clientOrderStatusMap[order.status],
     subtotal: order.subtotal_cents,
     total: order.total_cents,
   };
 },


 // Lấy chi tiết đơn hàng của customer hiện tại.
 async getMyOrderDetail(userId: string, orderNumber: string) {
   return OrderService.getOrderDetail(orderNumber, { role: "CUSTOMER", userId });
 },


 // Lấy chi tiết đơn hàng cho admin, không ràng buộc user_id và có history logs.
 async getOrderDetailForAdmin(orderNumber: string) {
   return OrderService.getOrderDetail(orderNumber, { role: "ADMIN" });
 },


 // Admin cập nhật trạng thái đơn hàng và ghi lại lịch sử thay đổi trạng thái.
 async updateOrderStatus(data: UpdateOrderStatusInput, adminId: string) {
   const order = await prisma.order.findUnique({
     where: { order_number: data.order_number },
     select: { id: true, status: true },
   });


   if (!order) throw new Error("Không tìm thấy đơn hàng phù hợp.");
   if (order.status === OrderStatus.CANCELLED) throw new Error("Đơn hàng đã bị hủy nên không thể cập nhật trạng thái.");
   if (order.status === data.status) return OrderService.getOrderDetailForAdmin(data.order_number);


   await prisma.$transaction([
     prisma.order.update({
       where: { id: order.id },
       data: { status: data.status },
     }),
     prisma.orderHistoryLog.create({
       data: {
         current_status: data.status,
         note: data.note || "Admin cập nhật trạng thái đơn hàng",
         order_id: order.id,
         previous_status: order.status,
         updated_by: adminId,
       },
     }),
   ]);


   return OrderService.getOrderDetailForAdmin(data.order_number);
 },


 // Admin/client hủy đơn hàng, ghi log và hoàn lại lượt dùng mã giảm giá nếu đơn có áp mã.
 async cancelOrder(orderId: string, reason: string, updatedBy: "admin" | "user") {
   const order = await prisma.order.findFirst({
     where: {
       OR: [
         ...(isUuid(orderId) ? [{ id: orderId }] : []),
         { order_number: orderId },
       ],
     },
     include: {
       discount_usages: true,
     },
   });


   if (!order) throw new Error("Không tìm thấy đơn hàng phù hợp.");
   if (order.status === OrderStatus.CANCELLED) return OrderService.getOrderDetailForAdmin(order.order_number);
   if (updatedBy === "user" && order.status !== OrderStatus.PENDING) {
     throw new Error("Đơn hàng đã được xử lý nên không thể tự hủy. Vui lòng liên hệ shop để được hỗ trợ.");
   }


   await prisma.$transaction(async (tx) => {
     await tx.order.update({
       where: { id: order.id },
       data: { status: OrderStatus.CANCELLED },
     });
     await tx.orderHistoryLog.create({
       data: {
         current_status: OrderStatus.CANCELLED,
         note: `${updatedBy === "admin" ? "Admin" : "Khách hàng"} hủy đơn: ${reason}`,
         order_id: order.id,
         previous_status: order.status,
       },
     });


     for (const usage of order.discount_usages) {
       await tx.discountCode.updateMany({
         where: {
           id: usage.discount_code_id,
           used_count: { gt: 0 },
         },
         data: {
           used_count: {
             decrement: 1,
           },
         },
       });
     }
     await tx.discountUsage.deleteMany({
       where: { order_id: order.id },
     });
   });


   return OrderService.getOrderDetailForAdmin(order.order_number);
 },


 // Lấy danh sách đơn hàng cho admin với filter linh hoạt và phân trang.
 async getOrders(params: GetListOrdersParams) {
   const { end_date, limit, page, search, search_keyword, start_date, status } = params;
   const skip = (page - 1) * limit;
   const keyword = (search_keyword ?? search)?.trim();
   const endDate = end_date
     ? new Date(new Date(end_date).setHours(23, 59, 59, 999))
     : undefined;


   const where: Prisma.OrderWhereInput = {
     ...((start_date || endDate) && {
       created_at: {
         ...(start_date && { gte: start_date }),
         ...(endDate && { lte: endDate }),
       },
     }),
     ...(status && { status }),
     ...(keyword && {
       OR: [
         { order_number: { contains: keyword, mode: "insensitive" } },
         { shipping_fullname: { contains: keyword, mode: "insensitive" } },
         { shipping_phone: { contains: keyword, mode: "insensitive" } },
         { guest_email: { contains: keyword, mode: "insensitive" } },
         { guest_phone: { contains: keyword, mode: "insensitive" } },
         { user: { email: { contains: keyword, mode: "insensitive" } } },
         { user: { phone: { contains: keyword, mode: "insensitive" } } },
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