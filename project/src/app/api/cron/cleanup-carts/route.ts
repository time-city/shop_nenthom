import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(req: Request) {
  // Authentication check cho cronjob, đảm bảo request đến từ Vercel Cron hoặc có header auth.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 30 ngày trước
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Xóa các cart của guest (user_id = null) và được cập nhật lần cuối cách đây > 30 ngày
    const result = await prisma.cart.deleteMany({
      where: {
        user_id: null,
        updated_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`[Cron Job] Cleanup guest carts: Deleted ${result.count} carts.`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} old guest carts.`,
    });
  } catch (error: any) {
    console.error('[Cron Job] Error cleaning up carts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
