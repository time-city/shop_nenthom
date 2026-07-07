"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CustomSelect from "@/src/components/admin/common/CustomSelect";
import type { SelectOption } from "@/src/components/admin/common/CustomSelect";
import Image from "next/image";
import { Star, MessageSquareReply, Eye, EyeOff, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { updateReviewStatusAction, deleteReviewAction, replyToReviewAction } from "@/src/lib/action/review.action";
import { useToast } from "@/src/components/ui/toastProvider";
import Modal from "@/src/components/ui/modal";

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
    startTransition(async () => {
      const result = await updateReviewStatusAction({ reviewId, is_published: !currentStatus });
      if (result.success) {
        toast.success({ title: "Thành công", message: "Đã cập nhật trạng thái hiển thị." });
        router.refresh();
      } else {
        toast.error({ title: "Lỗi", message: result.error || "Không thể cập nhật." });
      }
    });
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn?")) return;
    
    startTransition(async () => {
      const result = await deleteReviewAction(reviewId);
      if (result.success) {
        toast.success({ title: "Thành công", message: "Đã xóa đánh giá." });
        router.refresh();
      } else {
        toast.error({ title: "Lỗi", message: result.error || "Không thể xóa." });
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

    startTransition(async () => {
      const result = await replyToReviewAction({ reviewId: activeReview.id, admin_reply: replyContent });
      if (result.success) {
        toast.success({ title: "Thành công", message: "Đã gửi phản hồi." });
        setReplyModalOpen(false);
        setActiveReview(null);
        router.refresh();
      } else {
        toast.error({ title: "Lỗi", message: result.error || "Không thể phản hồi." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6 flex justify-between items-center relative z-20">
        <h1 className="dashboard-page-title">Quản lý Đánh giá</h1>
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

      <div className="dashboard-card overflow-hidden no-padding">
        <div className="dashboard-table-wrapper">
          <table className="dashboard-admin-table">
            <thead>
              <tr>
                <th className="px-6 py-4">Khách hàng / Ngày</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Hình ảnh</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {initialData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">Không có đánh giá nào phù hợp.</td>
                </tr>
              ) : (
                initialData.items.map((review: any) => (
                  <tr key={review.id} className="hover:bg-black/20 transition">
                    <td>
                      <p className="font-semibold text-[#F5F0E8]">{review.user?.fullname || review.user?.email}</p>
                      <p className="text-xs text-[#F5F0E8]/60 mt-1">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative shrink-0">
                          {review.product.images?.[0] ? (
                            <Image src={review.product.images[0]} alt="prod" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-700 line-clamp-2 max-w-[200px]">{review.product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 mb-1 text-[#D6A15F]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 line-clamp-3 max-w-[250px]">{review.content}</p>
                      {review.admin_reply && (
                        <div className="mt-2 bg-blue-50 text-blue-800 text-xs p-2 rounded border border-blue-100 line-clamp-2">
                          <span className="font-semibold">Đã TL:</span> {review.admin_reply}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {review.images && review.images.length > 0 ? (
                        <div className="flex gap-1">
                          {review.images.map((img: string, i: number) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer" className="relative size-10 rounded border overflow-hidden hover:opacity-80 transition">
                              <Image src={img} alt="fb" fill className="object-cover" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Không có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="size-3" /> Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Loader2 className="size-3" /> Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={isPending}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {initialData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                « Trang đầu
              </button>
            )}

            {(() => {
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(initialData.totalPages, startPage + 4);
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }
              return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`size-8 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-[#6B1218] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {page}
                </button>
              ));
            })()}

            {currentPage < initialData.totalPages && (
              <button
                onClick={() => handlePageChange(initialData.totalPages)}
                className="px-3 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">Phản hồi khách hàng</h2>
          {activeReview && (
            <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 mb-1 font-medium">{activeReview.user?.fullname}</p>
              <div className="flex items-center gap-1 mb-2 text-[#D6A15F]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-3 ${i < activeReview.rating ? "fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <p className="text-sm text-gray-800 italic">"{activeReview.content}"</p>
            </div>
          )}

          <form onSubmit={submitReply}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung phản hồi (sẽ hiển thị công khai)</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-[#6B1218] focus:border-[#6B1218] h-32 resize-none"
                placeholder="Cảm ơn bạn đã tin dùng sản phẩm của ChamCham..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
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
  );
}
