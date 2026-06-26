import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, UserStatus, ContactStatus, OrderStatus, PaymentMethod, PaymentStatus, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Cấu hình rõ ràng cho Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
console.log(process.env.DATABASE_URL);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Thêm 20 sản phẩm nến thơm mới...');
    
    // Tìm hoặc tạo category
    let category = await prisma.category.findFirst();
    if (!category) {
        category = await prisma.category.create({
            data: { name: 'Nến Thơm Tổng Hợp', description: 'Danh mục nến thơm tổng hợp', is_active: true }
        });
    }

    const newProducts = [
        { name: 'Nến Thơm Hương Mùa Thu', base_price_cents: 150000, description: 'Hương thơm nồng ấm của quế và cam.' },
        { name: 'Nến Thơm Biển Xanh', base_price_cents: 160000, description: 'Mang hơi thở của biển cả vào không gian nhà bạn.' },
        { name: 'Nến Thơm Hoa Hồng Cổ Điển', base_price_cents: 170000, description: 'Hương hoa hồng lãng mạn và quyến rũ.' },
        { name: 'Nến Thơm Gỗ Tuyết Tùng', base_price_cents: 180000, description: 'Hương gỗ ấm áp, nam tính và mộc mạc.' },
        { name: 'Nến Thơm Vani Ngọt Ngào', base_price_cents: 140000, description: 'Ngọt ngào, dịu nhẹ mang lại cảm giác thư giãn.' },
        { name: 'Nến Thơm Trà Xanh Thanh Khiết', base_price_cents: 150000, description: 'Giúp thanh lọc không khí, giảm căng thẳng.' },
        { name: 'Nến Thơm Oải Hương (Lavender)', base_price_cents: 190000, description: 'Mùi hương tinh tế giúp ngủ ngon và sâu giấc.' },
        { name: 'Nến Thơm Cà Phê Sáng', base_price_cents: 160000, description: 'Đánh thức tinh thần bằng hương cà phê rang xay.' },
        { name: 'Nến Thơm Gió Mùa Xuân', base_price_cents: 155000, description: 'Hương cỏ xanh và hoa ly tươi mát.' },
        { name: 'Nến Thơm Rừng Thông Đà Lạt', base_price_cents: 175000, description: 'Hương thông xanh ngát, se lạnh.' },
        { name: 'Nến Thơm Quả Mọng (Berry)', base_price_cents: 165000, description: 'Mùi hương trái cây chua ngọt, tươi vui.' },
        { name: 'Nến Thơm Hoa Nhài (Jasmine)', base_price_cents: 150000, description: 'Hương hoa nhài thoang thoảng, thanh lịch.' },
        { name: 'Nến Thơm Chanh Sả', base_price_cents: 145000, description: 'Đuổi muỗi, làm sạch không khí, sảng khoái.' },
        { name: 'Nến Thơm Gỗ Đàn Hương', base_price_cents: 195000, description: 'Hương thơm thiền định, an thần.' },
        { name: 'Nến Thơm Hoa Cúc La Mã', base_price_cents: 160000, description: 'Giảm stress, dịu nhẹ và thư thái.' },
        { name: 'Nến Thơm Quế Hồi', base_price_cents: 150000, description: 'Tuyệt vời cho những ngày mưa lạnh.' },
        { name: 'Nến Thơm Đào Ngọt', base_price_cents: 140000, description: 'Hương đào chín mọng, đáng yêu.' },
        { name: 'Nến Thơm Hổ Phách Sang Trọng', base_price_cents: 200000, description: 'Hương thơm trầm ấm, quyến rũ, bí ẩn.' },
        { name: 'Nến Thơm Bạc Hà Mát Lạnh', base_price_cents: 145000, description: 'Làm bừng tỉnh mọi giác quan.' },
        { name: 'Nến Thơm Dạ Lan Hương', base_price_cents: 170000, description: 'Hương hoa nồng nàn trong đêm.' },
    ];

    console.log('⏳ Đang tạo 20 sản phẩm...');
    let count = 0;
    for (const p of newProducts) {
        await prisma.product.create({
            data: {
                category_id: category.id,
                name: p.name,
                base_price_cents: p.base_price_cents,
                description: p.description,
                images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
                is_active: true
            }
        });
        count++;
    }
    console.log(`✅ Đã thêm mới ${count} sản phẩm thành công!`);

    return; // <-- Dừng tại đây, KHÔNG chạy các lệnh xoá bên dưới

    console.log('🌱 Bắt đầu dọn dẹp dữ liệu cũ (Reset)...');

    // Xóa dữ liệu cũ theo thứ tự đúng để tránh lỗi foreign key
    await prisma.discountUsage.deleteMany();
    await prisma.orderHistoryLog.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.shippingAddress.deleteMany();
    await prisma.user.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.discountCode.deleteMany();

    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.scent.deleteMany();
    await prisma.waxColor.deleteMany();
    await prisma.candleSize.deleteMany();
    await prisma.packaging.deleteMany();
    await prisma.topping.deleteMany();

    console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu...');
    const
        defaultPasswordHash = await bcrypt.hash('123456', 10);

    // ==========================================
    // 1. TẠO USERS & ADDRESSES
    // ==========================================
    const admin = await prisma.user.create({
        data: {
            email: 'admin@shopnenthom.com',
            password_hash: defaultPasswordHash,
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
            fullname: 'Admin Nến Thơm',
            phone: '0901234567',
        }
    });

    const customer1 = await prisma.user.create({
        data: {
            email: 'customer1@gmail.com',
            password_hash: defaultPasswordHash,
            role: Role.CUSTOMER,
            status: UserStatus.ACTIVE,
            fullname: 'Nguyễn Văn A',
            phone: '0987654321',
            shipping_addresses: {
                create: [
                    {
                        fullname: 'Nguyễn Văn A',
                        phone: '0987654321',
                        address: '123 Đường Số 1, Phường 2',
                        city: 'Hồ Chí Minh',
                        is_default: true,
                    }
                ]
            }
        }
    });

    const customer2 = await prisma.user.create({
        data: {
            email: 'customer2@gmail.com',
            password_hash: defaultPasswordHash,
            role: Role.CUSTOMER,
            status: UserStatus.ACTIVE,
            fullname: 'Trần Thị B',
            phone: '0912345678',
            shipping_addresses: {
                create: [
                    {
                        fullname: 'Trần Thị B',
                        phone: '0912345678',
                        address: '456 Lê Lợi',
                        city: 'Hà Nội',
                        is_default: true,
                    }
                ]
            }
        }
    });

    // ==========================================
    // 2. TẠO CONTACT
    // ==========================================
    await prisma.contact.create({
        data: {
            name: 'Khách hàng quan tâm',
            email: 'guest@example.com',
            subject: 'Hỏi về nến thơm quà tặng',
            message: 'Chào shop, mình muốn đặt 50 hũ nến làm quà tặng doanh nghiệp. Cho mình xin báo giá nhé.',
            status: ContactStatus.PENDING,
        }
    });

    // ==========================================
    // 3. TẠO DANH MỤC & SẢN PHẨM
    // ==========================================
    const catMinimalist = await prisma.category.create({
        data: {
            name: 'Nến Hũ Tối Giản',
            description: 'Dòng nến hũ thủy tinh mang phong cách minimalist sang trọng.',
            is_active: true
        },
    });
    const catSculptural = await prisma.category.create({
        data: {
            name: 'Nến Điêu Khắc',
            description: 'Nến đổ khuôn nghệ thuật trang trí không gian.',
            is_active: true
        },
    });

    const product1 = await prisma.product.create({
        data: {
            category_id: catMinimalist.id,
            name: 'Hũ Thủy Tinh Hổ Phách (Amber Jar)',
            base_price_cents: 180000,
            description: 'Hũ thủy tinh màu hổ phách nắp thiếc đen nhám, tỏa hương đều và giữ mùi cực tốt. Phù hợp cho không gian làm việc.',
            images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
            is_active: true
        }
    });

    const product2 = await prisma.product.create({
        data: {
            category_id: catSculptural.id,
            name: 'Khối Rubik Nghệ Thuật (Bubble Cube)',
            base_price_cents: 150000,
            description: 'Nến tạo hình khối tròn rubik phong cách Hàn Quốc, làm điểm nhấn hoàn hảo cho bàn trang điểm.',
            images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
            is_active: true
        }
    });

    // ==========================================
    // 4. TẠO OPTIONS (SCENT, COLOR, SIZE, PACKAGING, TOPPING)
    // ==========================================
    const scents = await Promise.all([
        prisma.scent.create({ data: { name: 'Santal 33', price_extra_cents: 30000 } }),
        prisma.scent.create({ data: { name: 'Wood Sage & Sea Salt', price_extra_cents: 20000 } }),
        prisma.scent.create({ data: { name: 'Trắng (Không mùi)', price_extra_cents: 0 } }),
    ]);

    const colors = await Promise.all([
        prisma.waxColor.create({ data: { name: 'Trắng Kem', hex_code: '#FDFBF7', price_extra_cents: 0 } }),
        prisma.waxColor.create({ data: { name: 'Đen Nhám', hex_code: '#1A1A1A', price_extra_cents: 10000 } }),
    ]);

    const sizes = await Promise.all([
        prisma.candleSize.create({ data: { name: 'Size S (100g)', weight_gram: 100, price_extra_cents: 0 } }),
        prisma.candleSize.create({ data: { name: 'Size M (200g)', weight_gram: 200, price_extra_cents: 60000 } }),
    ]);

    const packagings = await Promise.all([
        prisma.packaging.create({ data: { name: 'Không hộp', price_extra_cents: 0 } }),
        prisma.packaging.create({ data: { name: 'Hộp Quà Premium', price_extra_cents: 50000 } }),
    ]);

    const toppings = await Promise.all([
        prisma.topping.create({ data: { name: 'Lá Vàng 24k', price_extra_cents: 25000, in_stock: true } }),
        prisma.topping.create({ data: { name: 'Cánh Hoa Hồng Khô', price_extra_cents: 10000, in_stock: true } }),
    ]);

    // ==========================================
    // 5. TẠO DISCOUNT CODES
    // ==========================================
    const discount1 = await prisma.discountCode.create({
        data: {
            code: 'WELCOME10',
            discount_amount_cents: 10000, // 100.000 VNĐ
            type: DiscountType.FIXED,
            max_uses: 100,
            used_count: 0,
            is_active: true,
        }
    });

    const discount2 = await prisma.discountCode.create({
        data: {
            code: 'SUMMER20',
            discount_amount_cents: 20, // 20%
            type: DiscountType.PERCENTAGE,
            max_uses: 50,
            used_count: 1, // Will add 1 usage
            is_active: true,
        }
    });

    // ==========================================
    // 6. TẠO CARTS
    // ==========================================
    const cart = await prisma.cart.create({
        data: {
            user_id: customer1.id,
            items: {
                create: [
                    {
                        product_id: product1.id,
                        quantity: 2,
                        scent_id: scents[0].id,
                        size_id: sizes[0].id,
                        pack_id: packagings[0].id,
                        toppings_json: [toppings[0].id, toppings[1].id]
                    }
                ]
            }
        }
    });

    // ==========================================
    // 7. TẠO ORDERS & LOGS
    // ==========================================
    const order1 = await prisma.order.create({
        data: {
            order_number: 'ORD-0001',
            user_id: customer2.id,
            shipping_fullname: 'Trần Thị B',
            shipping_phone: '0912345678',
            shipping_address: '456 Lê Lợi',
            shipping_city: 'Hà Nội',
            status: OrderStatus.SHIPPED,
            payment_method: PaymentMethod.BANK_TRANSFER,
            payment_status: PaymentStatus.PAID,
            paid_at: new Date(),
            subtotal_cents: 210000, // 180000 + 30000
            discount_cents: 42000, // 20% of 210000
            shipping_cents: 30000,
            total_cents: 198000, // 210000 - 42000 + 30000
            items: {
                create: [
                    {
                        product_id: product1.id,
                        quantity: 1,
                        unit_price_cents: 210000, // 180000 + 30000
                        scent_id: scents[0].id,
                        size_id: sizes[0].id,
                    }
                ]
            },
            history_logs: {
                create: [
                    {
                        current_status: OrderStatus.PENDING,
                        note: 'Đơn hàng mới tạo'
                    },
                    {
                        previous_status: OrderStatus.PENDING,
                        current_status: OrderStatus.PROCESSING,
                        updated_by: admin.id,
                        note: 'Đang chuẩn bị hàng'
                    },
                    {
                        previous_status: OrderStatus.PROCESSING,
                        current_status: OrderStatus.SHIPPED,
                        updated_by: admin.id,
                        note: 'Đã giao cho đơn vị vận chuyển'
                    }
                ]
            },
            discount_usages: {
                create: [
                    {
                        discount_code_id: discount2.id,
                        user_id: customer2.id
                    }
                ]
            }
        }
    });

    console.log('✅ Bơm dữ liệu (Seed) thành công! Hãy check Database.');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi seed dữ liệu:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });