import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany(); 
  const user = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  
  if (!user) throw new Error("No user found");

  const reviewContents = [
    "Sản phẩm cực kỳ chất lượng, mùi hương lan tỏa rất xa.",
    "Bao bì đẹp mắt, rất thích hợp làm quà tặng cho bạn bè.",
    "Tôi rất ấn tượng với độ giữ mùi của nến, đốt cả ngày vẫn thơm.",
    "Giá cả phải chăng so với chất lượng, tôi sẽ mua lại.",
    "Mùi hương tinh tế không bị nồng gắt, rất dễ chịu.",
    "Shop giao hàng nhanh, bọc chống sốc cực kỳ cẩn thận.",
    "Nến thơm dùng rất thích, cảm giác thư giãn sau ngày dài làm việc.",
    "Tôi thích cách shop chăm chút cho từng sản phẩm.",
    "Cảm ơn shop, nến đẹp và thơm quá, 10 điểm nha!",
    "Lần thứ hai mua hàng ở đây và vẫn rất ưng ý."
  ];

  let addedCount = 0;
  for (const product of products) {
    for (let i = 0; i < 10; i++) {
      await prisma.review.create({
        data: {
          product_id: product.id,
          user_id: user.id,
          rating: Math.floor(Math.random() * 2) + 4, // random 4 or 5
          content: reviewContents[i],
          is_published: true
        }
      });
      addedCount++;
    }
  }
  console.log(`Added ${addedCount} reviews across all products.`);
}

main().finally(() => prisma.$disconnect());
