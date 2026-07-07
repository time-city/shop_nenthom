"use client";

import { useState, useOptimistic, useTransition, useMemo } from "react";
import { Star, StarHalf, MessageCircle, PenLine, X, ImageIcon, Loader2 } from "lucide-react";
import { createReviewAction } from "@/src/lib/action/review.action";
import { useToast } from "@/src/components/ui/toastProvider";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function ProductReviews({ 
  productId, 
  initialReviews, 
  isAuthenticated 
}: { 
  productId: string; 
  initialReviews: any;
  isAuthenticated: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginPromptModalOpen, setIsLoginPromptModalOpen] = useState(false);
  const [reviews, setReviews] = useState(initialReviews?.items || []);
  
  // Optimistic UI for immediate feedback
  const [optimisticReviews, addOptimisticReview] = useOptimistic(
    reviews,
    (state, newReview: any) => [newReview, ...state]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  
  const totalPages = Math.ceil(optimisticReviews.length / reviewsPerPage);
  
  const currentReviews = optimisticReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, cur: any) => acc + cur.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReviewSubmit = async (formData: { rating: number, content: string, images: string[] }) => {
    // Generate an optimistic review
    const optimisticData = {
      id: Math.random().toString(),
      rating: formData.rating,
      content: formData.content,
      images: formData.images,
      created_at: new Date().toISOString(),
      user: { fullname: "Bạn (Đang gửi...)" },
      is_optimistic: true,
      admin_reply: null
    };

    startTransition(() => {
      addOptimisticReview(optimisticData);
    });

    try {
      const result = await createReviewAction({
        productId,
        rating: formData.rating,
        content: formData.content,
        images: formData.images
      });

      if (result.success) {
        toast.success({
          title: "Gửi đánh giá thành công",
          message: "Đánh giá của bạn đang chờ quản trị viên duyệt."
        });
      } else {
        toast.error({
          title: "Lỗi",
          message: result.error || "Không thể gửi đánh giá."
        });
      }
    } catch (err) {
      toast.error({
        title: "Lỗi",
        message: "Đã xảy ra lỗi không xác định."
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`size-4 sm:size-5 ${i <= rating ? "fill-[#D6A15F] text-[#D6A15F]" : "text-[#F5F0E8]/30"}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="mt-16 sm:mt-24 w-full relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-[1px] bg-gradient-to-r from-transparent via-[#D6A15F]/30 to-transparent"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pt-6 pb-5 px-4 sm:px-6 bg-gradient-to-b from-black/20 to-transparent rounded-3xl border border-[#F5F0E8]/5 relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#D6A15F]/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-light bg-clip-text text-transparent bg-gradient-to-r from-[#F5F0E8] to-[#D6A15F] tracking-wide">
              Đánh giá
            </h2>
            <span className="font-serif text-xl sm:text-2xl font-light text-[#F5F0E8]/40">&</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F0E8] tracking-wide">
              Nhận xét
            </h2>
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center bg-[#D6A15F]/10 px-2.5 py-1 rounded-lg border border-[#D6A15F]/20">
              <Star className="size-4 fill-[#D6A15F] text-[#D6A15F] mr-1" />
              <span className="text-lg font-medium text-[#D6A15F] leading-none">{averageRating}</span>
              <span className="text-[#F5F0E8]/50 text-xs ml-1 self-end mb-[1px]">/ 5.0</span>
            </div>
            <span className="text-[#F5F0E8]/50 text-sm tracking-wide">Dựa trên <span className="font-medium text-[#F5F0E8]">{initialReviews?.total || 0}</span> phản hồi</span>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (!isAuthenticated) {
              setIsLoginPromptModalOpen(true);
              return;
            }
            setIsModalOpen(true);
          }}
          className="relative z-10 mt-5 sm:mt-0 group flex items-center justify-center gap-2 bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] text-[#2C1810] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-500 shadow-[0_4px_15px_rgba(214,161,95,0.25)] hover:shadow-[0_8px_20px_rgba(214,161,95,0.4)] hover:-translate-y-0.5 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <PenLine className="size-3.5" />
          <span className="font-medium text-xs sm:text-sm tracking-wider uppercase">Viết Đánh Giá</span>
        </button>
      </div>

      {optimisticReviews.length === 0 ? (
        <div className="text-center py-16 px-4 bg-black/10 backdrop-blur-md rounded-2xl border border-[#F5F0E8]/5">
          <MessageCircle className="size-12 mx-auto text-[#F5F0E8]/20 mb-4" />
          <p className="text-[#F5F0E8]/60 font-light text-lg">Chưa có đánh giá nào cho sản phẩm này.</p>
          <p className="text-[#F5F0E8]/40 text-sm mt-1">Hãy là người đầu tiên chia sẻ cảm nhận của bạn!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentReviews.map((review: any) => (
              <div 
                key={review.id} 
                className={`p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-[#F5F0E8]/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-500 ${review.is_optimistic ? 'opacity-50 blur-[1px] animate-pulse' : 'opacity-100'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#D6A15F]/20 flex items-center justify-center text-[#D6A15F] font-serif text-lg font-bold">
                      {review.user?.fullname?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div>
                      <h4 className="text-[#F5F0E8] font-medium">{review.user?.fullname || "Khách hàng"}</h4>
                      <span className="text-[#F5F0E8]/40 text-xs">
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <p className="text-[#F5F0E8]/80 text-sm leading-relaxed mb-4 flex-grow">
                  {review.content}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-auto pt-4 border-t border-[#F5F0E8]/5 overflow-x-auto pb-2 scrollbar-hide">
                    {review.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative size-16 flex-shrink-0 rounded-lg overflow-hidden border border-[#F5F0E8]/10">
                        <Image src={img} alt="Feedback" fill className="object-cover hover:scale-110 transition duration-500" sizes="64px" />
                      </div>
                    ))}
                  </div>
                )}

                {review.admin_reply && (
                  <div className="mt-4 pt-4 border-t border-[#F5F0E8]/10">
                    <div className="bg-[#6B1218]/10 rounded-xl p-4 border border-[#6B1218]/20 relative">
                      <div className="absolute -top-2 left-6 px-2 bg-transparent text-xs font-semibold text-[#D6A15F] tracking-widest uppercase">Phản hồi từ ChamCham</div>
                      <p className="text-[#F5F0E8]/70 text-sm italic leading-relaxed pt-1">
                        {review.admin_reply}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-[#D6A15F]/30 text-[#F5F0E8] hover:bg-[#D6A15F]/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Trang trước
              </button>
              <span className="text-[#F5F0E8]/70 text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-[#D6A15F]/30 text-[#F5F0E8] hover:bg-[#D6A15F]/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Login Prompt Modal */}
      {isLoginPromptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-sm rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all text-center p-8 border border-[#D6A15F]/40 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/rose_bg.jpg')" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[#3a080f]/70" />
            <div className="relative z-10">
              <div className="size-16 rounded-full bg-[#D6A15F]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(214,161,95,0.2)]">
                <PenLine className="size-8 text-[#D6A15F]" />
              </div>
              <h3 className="font-serif text-2xl font-light text-[#F5F0E8] mb-3">Yêu cầu đăng nhập</h3>
              <p className="text-[#F5F0E8]/70 text-sm mb-8">
                Vui lòng đăng nhập để có thể viết đánh giá cho sản phẩm này và nhận thêm ưu đãi.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push(`/login?redirect=${pathname}`)}
                  className="w-full bg-[#D6A15F] hover:bg-[#c48d45] text-[#2C1810] font-semibold py-3 rounded-xl transition duration-300 shadow-[0_4px_15px_rgba(214,161,95,0.3)]"
                >
                  Đăng nhập ngay
                </button>
                <button 
                  onClick={() => setIsLoginPromptModalOpen(false)}
                  className="w-full bg-transparent border border-[#F5F0E8]/20 hover:bg-white/5 text-[#F5F0E8] font-medium py-3 rounded-xl transition duration-300"
                >
                  Tiếp tục xem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleReviewSubmit} 
      />
    </div>
  );
}

// --------------------------------------------------------------------------------
// MODAL COMPONENT (Internal or separated. Keeping here for cohesion if small enough)
// --------------------------------------------------------------------------------

function ReviewFormModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => Promise<void> }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 3) return;
    
    setIsSubmitting(true);
    // In a real scenario, we'd upload images to Cloudinary here. 
    // For now, we pass an empty array or handle mock images.
    await onSubmit({ rating, content, images: [] });
    setIsSubmitting(false);
    setContent("");
    setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-[#2C1810] border border-[#D6A15F]/30 w-full max-w-lg rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#F5F0E8]/10">
          <h3 className="font-serif text-2xl font-light text-[#F5F0E8]">Viết đánh giá</h3>
          <button onClick={onClose} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition rounded-full p-2 hover:bg-white/5">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 flex flex-col items-center">
            <p className="text-[#F5F0E8]/70 mb-3 text-sm">Đánh giá của bạn về sản phẩm này?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`size-8 ${(hoverRating || rating) >= star ? "fill-[#D6A15F] text-[#D6A15F]" : "text-[#F5F0E8]/20"} transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[#F5F0E8]/70 text-sm mb-2">Nhận xét của bạn</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về mùi hương, thiết kế..."
              className="w-full bg-black/20 border border-[#F5F0E8]/10 rounded-xl p-4 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-[#D6A15F]/50 focus:ring-1 focus:ring-[#D6A15F]/50 transition h-32 resize-none"
              required
            ></textarea>
          </div>

          <div className="mb-8">
            <label className="block text-[#F5F0E8]/70 text-sm mb-2">Đính kèm hình ảnh (Tùy chọn)</label>
            <button type="button" className="w-full border border-dashed border-[#F5F0E8]/20 rounded-xl p-4 flex flex-col items-center justify-center text-[#F5F0E8]/50 hover:bg-white/5 hover:text-[#F5F0E8]/80 hover:border-[#F5F0E8]/40 transition group cursor-pointer">
              <ImageIcon className="size-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Bấm để tải ảnh lên</span>
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || content.trim().length < 3}
            className="w-full bg-[#D6A15F] hover:bg-[#c48d45] text-[#2C1810] font-semibold py-4 rounded-xl transition duration-300 shadow-[0_4px_15px_rgba(214,161,95,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="size-5 animate-spin" /> Đang gửi...</>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
