import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🔍 Checking categories in database...');
    let category = await prisma.category.findFirst({
        where: { is_active: true }
    });

    if (!category) {
        console.log('🌱 No active category found. Creating a default category...');
        category = await prisma.category.create({
            data: {
                name: 'Nến Thơm Cao Cấp',
                description: 'Các dòng nến thơm thiên nhiên cao cấp giúp thư giãn không gian.',
                is_active: true
            }
        });
    }

    console.log(`📌 Using category: "${category.name}" (ID: ${category.id})`);

    const productsToCreate = [
        {
            category_id: category.id,
            name: 'Nến Thơm Đà Lạt Sương Mù (Mist of Dalat)',
            base_price_cents: 220000,
            description: 'Mang không khí se lạnh và hương thơm trong lành của rừng thông Đà Lạt vào ngôi nhà của bạn. Hương gỗ thông trầm ấm kết hợp với chút sương mai mát lạnh giúp giải tỏa căng thẳng sau ngày làm việc dài.',
            ingredients: 'Sáp đậu nành tự nhiên, tinh dầu thông Đà Lạt, tinh dầu tuyết tùng, gỗ đàn hương, bấc gỗ nhập khẩu.',
            usage_instructions: 'Đốt nến tối thiểu 1 giờ trong lần đầu tiên để sáp tan chảy đều bề mặt. Cắt ngắn bấc gỗ còn khoảng 5mm trước mỗi lần đốt tiếp theo.',
            images: [
                'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1602874801007-bd458cb6d86b?q=80&w=600&auto=format&fit=crop'
            ],
            is_active: true,
            is_custom: false
        },
        {
            category_id: category.id,
            name: 'Nến Thơm Hoàng Hôn Sài Gòn (Saigon Sunset)',
            base_price_cents: 240000,
            description: 'Tái hiện sắc cam rực rỡ và những làn gió chiều mát rượi bên sông Sài Gòn. Hương cam ngọt ngào pha chút nồng nàn của hoa lài và hổ phách ấm áp tạo cảm giác lãng mạn và bình yên.',
            ingredients: 'Sáp ong tự nhiên, sáp cọ hảo hạng, tinh dầu cam ngọt, tinh dầu hoa nhài tây, tinh dầu hổ phách.',
            usage_instructions: 'Đặt nến ở nơi bằng phẳng, tránh gió lùa và xa tầm tay trẻ em. Không đốt nến liên tục quá 4 giờ.',
            images: [
                'https://images.unsplash.com/photo-1596435707261-086088a9a13e?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1572017329972-e14b285375d8?q=80&w=600&auto=format&fit=crop'
            ],
            is_active: true,
            is_custom: false
        },
        {
            category_id: category.id,
            name: 'Nến Thơm Oải Hương Thư Giãn (Sleepy Lavender)',
            base_price_cents: 195000,
            description: 'Liệu pháp mùi hương hoàn hảo cho giấc ngủ ngon. Tinh dầu oải hương Pháp kết hợp cùng hương thảo mộc dịu mát đưa bạn vào trạng thái thư thái sâu trước khi chìm vào giấc ngủ.',
            ingredients: 'Sáp đậu nành 100%, tinh dầu oải hương nguyên chất nhập khẩu Pháp, tinh dầu xô thơm, tinh dầu gỗ hồng.',
            usage_instructions: 'Đốt nến trong phòng ngủ khoảng 30-45 phút trước khi đi ngủ. Tắt nến trước khi ngủ và tận hưởng mùi hương thư giãn còn lưu lại.',
            images: [
                'https://images.unsplash.com/photo-1557088192-3bc3a21626f2?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1594958826500-1c6e174b29bb?q=80&w=600&auto=format&fit=crop'
            ],
            is_active: true,
            is_custom: false
        },
        {
            category_id: category.id,
            name: 'Nến Thơm Trà Xanh Tĩnh Lặng (Kyoto Matcha)',
            base_price_cents: 210000,
            description: 'Cảm giác thanh tịnh và sảng khoái lấy cảm hứng từ các buổi trà đạo Nhật Bản. Mùi hương matcha đậm đà, tươi mới hòa quyện cùng chút ngọt nhẹ của vani đưa tâm hồn bạn về trạng thái tĩnh tại.',
            ingredients: 'Sáp đậu nành, tinh dầu bột trà xanh matcha Nhật Bản, tinh dầu trà trắng, vani Madagascar.',
            usage_instructions: 'Đốt nến khi đọc sách, tập yoga hoặc làm việc để tăng cường sự tập trung và làm dịu tinh thần.',
            images: [
                'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop'
            ],
            is_active: true,
            is_custom: false
        }
    ];

    console.log('🚀 Creating 4 products in database...');
    for (const p of productsToCreate) {
        const created = await prisma.product.create({
            data: {
                category_id: p.category_id,
                name: p.name,
                base_price_cents: p.base_price_cents,
                description: p.description,
                ingredients: p.ingredients,
                usage_instructions: p.usage_instructions,
                images: p.images,
                is_active: p.is_active,
                is_custom: p.is_custom
            }
        });
        console.log(`✅ Created product: "${created.name}" (ID: ${created.id})`);
    }

    console.log('🎉 Done creating products!');
}

main()
    .catch((err) => {
        console.error('❌ Error executing script:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
