"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomSelect from "@/src/components/admin/common/CustomSelect";
import type { SelectOption } from "@/src/components/admin/common/CustomSelect";
import Image from "next/image";
import { Star, MessageSquareReply, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { updateReviewStatusAction, replyToReviewAction, getAllReviewsAdminAction } from "@/src/lib/action/review.action";
import useSWR from "swr";

type ActionResult<T = any> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

const fetcher = async ([action, args]: [unknown, unknown]) => {
  const fn = action as (input: unknown) => Promise<unknown> | unknown;
  const result = (await fn(args)) as ActionResult;
  if (!result.success) throw new Error(result.error);
  return result.data;
};
import { useToast } from "@/src/components/ui/toastProvider";
import Modal from "@/src/components/ui/modal";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";

export default function AdminReviewsClient({ 
  initialData, 
  currentPage, 
  currentStatus, 
  currentRating 
}: { 
  initialData: any; 
  currentPage: number; 
  currentStatus: string; 
  currentRating?: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: fetchResult, mutate: mutateReviews } = useSWR(
    [getAllReviewsAdminAction, { page: currentPage, limit: 6, status: currentStatus, rating: currentRating }],
    async ([action, args]) => {
      console.log("[Data Source] 🟡 NETWORK QUERY - AdminReviewsClient: Fetching reviews...");
      return fetcher([action, args]);
    },
    { fallbackData: initialData, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (fetchResult) {
      console.log("[Data Source] 🟢 UI UPDATED - AdminReviewsClient: Displaying reviews (from SWR Cache or Network)");
    }
  }, [fetchResult]);

  const reviewsData = fetchResult || initialData;

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // reset page on filter
    router.push(`/admin/reviews?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    router.push(`/admin/reviews?${params.toString()}`);
  };

  const handleToggleStatus = async (reviewId: string, currentStatus: boolean) => {
    const previousData = fetchResult;
    mutateReviews(
      (current: any) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((r: any) => 
            r.id === reviewId ? { ...r, is_published: !currentStatus } : r
          )
        };
      },
      false
    );

    startTransition(async () => {
      const result = await updateReviewStatusAction({ reviewId, is_published: !currentStatus });
      if (result.success) {
        toast.success({ title: "Thành công", message: "Đã cập nhật trạng thái hiển thị." });
        mutateReviews();
      } else {
        toast.error({ title: "Lỗi", message: result.error || "Không thể cập nhật." });
        mutateReviews(previousData, false);
      }
    });
  };


  const handleOpenReply = (review: any) => {
    setActiveReview(review);
    setReplyContent(review.admin_reply || "");
    setReplyModalOpen(true);
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview || !replyContent.trim()) return;

    const previousData = fetchResult;
    mutateReviews(
      (current: any) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((r: any) => 
            r.id === activeReview.id ? { ...r, admin_reply: replyContent } : r
          )
        };
      },
      false
    );

    startTransition(async () => {
      const result = await replyToReviewAction({ reviewId: activeReview.id, admin_reply: replyContent });
      if (result.success) {
        toast.success({ title: "Thành công", message: "Đã gửi phản hồi." });
        setReplyModalOpen(false);
        setActiveReview(null);
        mutateReviews();
      } else {
        toast.error({ title: "Lỗi", message: result.error || "Không thể phản hồi." });
        mutateReviews(previousData, false);
      }
    });
  };

  return (
    <>
      <AdminHeader
        title="Quản lý Đánh giá"
        subtitle="Quản lý và phản hồi đánh giá của khách hàng"
      />
      <div className="dashboard-page-content space-y-6">
        <section className="dashboard-card relative z-20">
          <div className="dashboard-card-body flex justify-end">
            <div className="flex gap-4">
              <CustomSelect 
                value={currentStatus} 
                onChange={(val) => handleFilterChange('status', val)}
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Chờ duyệt", value: "pending" },
                  { label: "Đã hiển thị", value: "published" }
                ]}
              />

              <CustomSelect 
                value={currentRating ? currentRating.toString() : 'all'} 
                onChange={(val) => handleFilterChange('rating', val)}
                options={[
                  { label: "Tất cả số sao", value: "all" },
                  { label: "5 Sao", value: "5" },
                  { label: "4 Sao", value: "4" },
                  { label: "3 Sao", value: "3" },
                  { label: "2 Sao", value: "2" },
                  { label: "1 Sao", value: "1" }
                ]}
              />
            </div>
          </div>
        </section>

      <div className="dashboard-card overflow-hidden no-padding">
        <div className="dashboard-table-wrapper">
          <TableResponsiveWrapper minWidth={900}>
          <table className="dashboard-admin-table">
            <thead>
              <tr>
                <th>Khách hàng / Ngày</th>
                <th>Sản phẩm</th>
                <th>Đánh giá</th>
                <th>Hình ảnh</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviewsData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">Không có đánh giá nào phù hợp.</td>
                </tr>
              ) : (
                reviewsData.items.map((review: any) => (
                  <tr key={review.id} className="transition">
                    <td>
                      <p className="font-semibold text-[#2C1810]">{review.user?.fullname || review.user?.email}</p>
                      <p className="text-xs text-[#6B4E35] mt-1">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md overflow-hidden bg-[#6B4E35]/20 relative shrink-0">
                          {review.product.images?.[0] ? (
                            <Image src={review.product.images[0]} alt="prod" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#6B4E35]/10"></div>
                          )}
                        </div>
                        <span className="font-medium text-[#2C1810] line-clamp-2 max-w-[200px]">{review.product.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 mb-1 text-[#D6A15F]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3 ${i < review.rating ? "fill-current" : "text-[#6B4E35]/30"}`} />
                        ))}
                      </div>
                      <p className="text-[#6B4E35] line-clamp-3 max-w-[250px]">{review.content}</p>
                      {review.admin_reply && (
                        <div className="mt-2 bg-[#D6A15F]/10 text-[#8B6030] text-xs p-2 rounded border border-[#D6A15F]/30 line-clamp-2">
                          <span className="font-semibold">Đã TL:</span> {review.admin_reply}
                        </div>
                      )}
                    </td>
                    <td>
                      {review.images && review.images.length > 0 ? (
                        <div className="flex gap-1">
                          {review.images.map((img: string, i: number) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer" className="relative size-10 rounded border border-[#6B4E35]/20 overflow-hidden hover:opacity-80 transition">
                              <Image src={img} alt="fb" fill className="object-cover" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#6B4E35]/60 italic">Không có</span>
                      )}
                    </td>
                    <td>
                      {review.is_published ? (
                        <span className="dashboard-status completed">
                          <CheckCircle className="size-3" /> Hiển thị
                        </span>
                      ) : (
                        <span className="dashboard-status pending">
                          <Loader2 className="size-3" /> Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(review.id, review.is_published)}
                          disabled={isPending}
                          className={`p-2 rounded-lg transition ${review.is_published ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                          title={review.is_published ? "Ẩn đánh giá này" : "Duyệt & Hiển thị"}
                        >
                          {review.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenReply(review)}
                          disabled={isPending}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          title="Trả lời khách hàng"
                        >
                          <MessageSquareReply className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </TableResponsiveWrapper>
        </div>

        {/* Pagination */}
        {reviewsData.totalPages > 1 && (
          <div className="p-4 border-t border-[#6B4E35]/15 flex justify-center gap-2">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition bg-[#F5F0E8] text-[#6B4E35] hover:bg-[#EDE5D8] border border-[#6B4E35]/20"
              >
                « Trang đầu
              </button>
            )}

            {(() => {
              const startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(reviewsData.totalPages, startPage + 4);
              let adjustedStartPage = startPage;
              if (endPage - adjustedStartPage < 4) {
                adjustedStartPage = Math.max(1, endPage - 4);
                endPage = Math.min(reviewsData.totalPages, adjustedStartPage + 4);
              }
              
              return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => adjustedStartPage + i).map((page) => (

                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`size-8 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-[#6B1218] text-white" : "bg-[#F5F0E8] text-[#6B4E35] hover:bg-[#EDE5D8] border border-[#6B4E35]/20"}`}
                >
                  {page}
                </button>
              ));
            })()}

            {currentPage < reviewsData.totalPages && (
              <button
                onClick={() => handlePageChange(reviewsData.totalPages)}
                className="px-3 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition bg-[#F5F0E8] text-[#6B4E35] hover:bg-[#EDE5D8] border border-[#6B4E35]/20"
              >
                Trang cuối »
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <Modal isOpen={replyModalOpen} onClose={() => setReplyModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#2C1810] mb-4">Phản hồi khách hàng</h2>
          {activeReview && (
            <div className="mb-4 bg-[#F5F0E8]/60 p-4 rounded-xl border border-[#6B4E35]/20">
              <p className="text-sm text-[#2C1810]/70 mb-1 font-medium">{activeReview.user?.fullname}</p>
              <div className="flex items-center gap-1 mb-2 text-[#D6A15F]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-3 ${i < activeReview.rating ? "fill-current" : "text-[#6B4E35]/30"}`} />
                ))}
              </div>
              <p className="text-sm text-[#2C1810] italic">&ldquo;{activeReview.content}&rdquo;</p>
            </div>
          )}

          <form onSubmit={submitReply}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2C1810]/80 mb-2">Nội dung phản hồi (sẽ hiển thị công khai)</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full border border-[#6B4E35]/30 rounded-lg p-3 text-sm focus:ring-[#6B1218] focus:border-[#6B1218] h-32 resize-none bg-[#F5F0E8]/50 text-[#2C1810]"
                placeholder="Cảm ơn bạn đã tin dùng sản phẩm của ChamCham..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 text-[#6B4E35] bg-[#F5F0E8] rounded-lg hover:bg-[#E8DDD0] transition font-medium border border-[#6B4E35]/20"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending || !replyContent.trim()}
                className="px-4 py-2 text-white bg-[#6B1218] rounded-lg hover:bg-[#520d12] transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Lưu phản hồi
              </button>
            </div>
          </form>
        </div>
      </Modal>
      </div>
    </>
  );
}
