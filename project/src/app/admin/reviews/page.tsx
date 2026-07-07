import { Metadata } from "next";
import AdminReviewsClient from "@/src/components/admin/reviews/AdminReviewsClient";
import { getAllReviewsAdminAction } from "@/src/lib/action/review.action";
import { callAction } from "@/src/lib/utils/callAction";

export const metadata: Metadata = {
  title: "Quản lý Đánh giá | Admin",
  description: "Quản lý đánh giá và nhận xét của khách hàng",
};

export default async function AdminReviewsPage(props: { searchParams: Promise<{ page?: string; status?: string; rating?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const status = (searchParams.status as any) || 'all';
  const rating = searchParams.rating ? Number(searchParams.rating) : undefined;

  const result = await callAction(
    () => getAllReviewsAdminAction({ page, limit: 6, status, rating }), 
    "Lỗi tải danh sách đánh giá"
  );

  let initialData: any = { items: [], total: 0, totalPages: 1 };
  if (result && "success" in result && result.success && result.data) {
    initialData = result.data;
  }

  return <AdminReviewsClient initialData={initialData} currentPage={page} currentStatus={status} currentRating={rating} />;
}
