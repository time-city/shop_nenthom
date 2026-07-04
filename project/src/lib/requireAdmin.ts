import prisma from "./prisma";
import { getSession } from "./session";

export type RequireAdminResult =
  | { adminId: string }
  | { error: string };

// Xác thực lại quyền và trạng thái admin từ DB để dùng chung trong server actions.
export async function requireAdmin(): Promise<RequireAdminResult> {
  const startTime = performance.now();

  try {
    const session = await getSession();

    if (!session?.sub) {
      return { error: "Vui lòng đăng nhập để tiếp tục" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return { error: "Tài khoản không hợp lệ hoặc đã bị khóa" };
    }

    if (user.role !== "ADMIN") {
      return { error: "Bạn không có quyền truy cập khu vực này" };
    }

    return { adminId: session.sub };
  } finally {
    console.log(
      `[requireAdmin] Execution time: ${(performance.now() - startTime).toFixed(2)}ms`,
    );
  }
}
