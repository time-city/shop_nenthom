import prisma from "../prisma"
import { UpdateProfileFormState } from "../validations/user.schema"


export const UserService = {
   async updateProfile(id: string, data: UpdateProfileFormState) {
       const existingUser = await prisma.user.findFirst({
           where: {
               id: {
                   not: id,
               },
               phone: data.phone,
           },
       });
       if (existingUser) {
           throw new Error('Số điện thoại đã tồn tại');
       }
       // update inf user
       const updateUser = await prisma.$transaction(async (tx) => {
            // Lấy địa chỉ mặc định hiện tại của user (nếu có)
            const defaultAddress = await tx.shippingAddress.findFirst({
                where: {
                    user_id: id,
                    is_default: true,
                },
                select: {id: true}
            });

            // Cap nhat thong tin ca nhan
            const userResult = await tx.user.update({
               where: {id},
               data: {
                    fullname: data.fullname,
                    phone: data.phone
               },
               select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                    role: true
               }
            });

            // xử lý địa chỉ từ form
            if(data.address && data.city){
                if(defaultAddress){
                    await tx.shippingAddress.update({
                        where: {id: defaultAddress.id},
                        data: {
                            fullname: data.fullname ?? userResult.fullname ?? "Người nhận",
                            phone: data.phone ?? userResult.phone ?? "",
                            address: data.address,
                            city: data.city
                        }
                    });
                }else{
                    await tx.shippingAddress.create({
                        data: {
                            user_id: id,
                            fullname: data.fullname ?? userResult.fullname ?? "Người nhận",
                            phone: data.phone ?? userResult.phone ?? "",
                            address: data.address,
                            city: data.city,
                            is_default: true
                        }
                    });
                }
            }

            return userResult;
       })
       return updateUser;
   },


   async getAllUsers() {
       return prisma.user.findMany({
           orderBy: { created_at: "desc" },
           select: {
               id: true,
               fullname: true,
               email: true,
               phone: true,
               role: true,
               status: true,
               created_at: true,
           }
       });
   },


   async toggleUserStatus(id: string) {
       const user = await prisma.user.findUnique({
           where: { id },
           select: { status: true },
       });


       if (!user) {
           throw new Error("Không tìm thấy người dùng");
       }


       const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";


       return prisma.user.update({
           where: { id },
           data: { status: newStatus },
       });
   },


   async toggleUserRole(id: string) {
       const user = await prisma.user.findUnique({
           where: { id },
           select: { role: true },
       });


       if (!user) {
           throw new Error("Không tìm thấy người dùng");
       }


       const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";


       return prisma.user.update({
           where: { id },
           data: { role: newRole },
       });
   },


   async getUserOrders(userId: string) {
       const orders = await prisma.order.findMany({
           where: { user_id: userId },
           orderBy: { created_at: "desc" },
           include: {
               items: {
                   include: {
                       product: true,
                   }
               }
           }
       });


       return orders.map((order) => {
           const statusText = order.status === "DELIVERED"
               ? "Hoàn thành"
               : order.status === "SHIPPED"
                   ? "Đang giao"
                   : order.status === "CANCELLED"
                       ? "Đã hủy"
                       : "Đang xử lý";


           return {
               id: order.order_number,
               date: order.created_at.toLocaleDateString("vi-VN"),
               total: `${(order.total_cents).toLocaleString("vi-VN")} đ`,
               status: statusText,
               items: order.items.map(item => `${item.quantity}x ${item.product.name}`).join(", "),
           };
       });
   }
}
