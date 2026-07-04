"use client";

/**
 * StoreProvider — bọc ở layout cao nhất để đảm bảo các Zustand store
 * được hydrate đúng cách trên client (tránh SSR mismatch).
 *
 * Zustand với persist tự động xử lý hydration, component này chỉ là
 * wrapper rõ ràng để dễ thêm logic nếu cần về sau.
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
