import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const userId = "c1860a4f-a9cb-4c55-8ec0-2178afb282d8"; // need a valid UUID
    
    // Let's first find any valid user to get a UUID
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found");
        return;
    }
    
    console.log("Found user:", user.id);

    const data = {
        fullname: "Khách hàng",
        phone: "0900000000",
        address: "Jade Private Fitness, 46, Đường Nại Nam",
        ward: "Phường Hòa Cường Bắc",
        district: "Quận Hải Châu",
        city: "Thành phố Đà Nẵng"
    };

    const count = await prisma.shippingAddress.count({ where: { user_id: user.id } });
    const isDefault = count === 0;

    const result = await prisma.shippingAddress.create({
        data: {
            ...data,
            user_id: user.id,
            is_default: isDefault
        }
    });
    console.log("SUCCESS:", result);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
