/**
 * In-memory rate limiter cho Server Actions (không cần Redis).
 * Sử dụng Map với key = identifier (IP hoặc email), value = { count, resetAt }.
 * 
 * Lưu ý: Trong môi trường serverless (Vercel), mỗi cold start sẽ reset bộ nhớ.
 * Tuy nhiên đây là lớp bảo vệ hữu hiệu ngăn brute-force trong cùng 1 instance.
 * Để production-grade, thay bằng Upstash Redis (@upstash/ratelimit).
 */

type RateLimitRecord = {
    count: number;
    resetAt: number; // timestamp ms
};

const store = new Map<string, RateLimitRecord>();

/**
 * Check và tính rate limit cho một key.
 * @param key       Identifier (ví dụ: IP hoặc email)
 * @param maxRequests Số request tối đa trong windowMs
 * @param windowMs  Cửa sổ thời gian tính bằng millisecond
 * @returns { allowed: true } nếu trong giới hạn, { allowed: false, retryAfterSeconds } nếu vượt
 */
export function checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
        // Tạo mới hoặc reset cửa sổ
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
    }

    if (record.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
        return { allowed: false, retryAfterSeconds };
    }

    record.count += 1;
    return { allowed: true };
}

// Dọn dẹp records hết hạn định kỳ để tránh memory leak
// (Chỉ chạy trong Node.js runtime, không chạy ở Edge runtime)
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of store.entries()) {
            if (now > record.resetAt) {
                store.delete(key);
            }
        }
    }, 5 * 60 * 1000); // Dọn mỗi 5 phút
}
