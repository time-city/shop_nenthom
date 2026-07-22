"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Star, StarHalf, MessageCircle, PenLine, X, ImageIcon, Loader2, Edit2, Trash2 } from "lucide-react";
import { createReviewAction, updateReviewByUserAction, deleteReviewByUserAction } from "@/src/lib/action/review.action";
import { useToast } from "@/src/components/ui/toastProvider";
import { useUserStore } from "@/src/store/useUserStore";
import { usePublicProductSocket } from "@/src/hooks/usePublicProductSocket";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { getReviewsByProductAction } from "@/src/lib/action/review.action";

type AnyFn = (args: any) => Promise<any> | any;

const fetcher = async ([action, args]: [AnyFn, any]) => {
  const result = await action(args);
  if (!result.success) throw new Error(result.error);
  return result.data;
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginPromptModalOpen, setIsLoginPromptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUserStore((state) => state.user);
  
  const { data: fetchResult, mutate: mutateReviews } = useSWR(
    [getReviewsByProductAction, { productId, limit: 50 }],
    fetcher,
    { fallbackData: initialReviews, revalidateOnFocus: false }
  );

  const reviewsData = fetchResult || initialReviews;
  const reviews = reviewsData?.items || [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  
  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, cur: any) => acc + cur.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    const handleReviewReplied = (event: Event) => {
      const customEvent = event as CustomEvent;
      // You can check customEvent.detail.productId if you want, but revalidating is fine
      mutateReviews();
    };

    window.addEventListener("user-socket-review-replied", handleReviewReplied);
    return () => {
      window.removeEventListener("user-socket-review-replied", handleReviewReplied);
    };
  }, [mutateReviews]);

  usePublicProductSocket({
    productId,
    onReviewListUpdated: (data) => {
      mutateReviews();
      if (data.message && data.actorId !== user?.id) {
        toast.info(data.message);
      }
    }
  });

  const handleReviewSubmit = async (formData: { rating: number, content: string, images: string[] }) => {
    setIsSubmitting(true);
    try {
      let res;
      if (editingReview) {
        res = await updateReviewByUserAction(editingReview.id, {
          productId,
          ...formData
        });
      } else {
        res = await createReviewAction({
          productId,
          ...formData
        });
      }
      
      if (!res.success) {
        toast.error(res.error || "Có lỗi xảy ra.");
        setIsSubmitting(false);
        return;
      }

      toast.success(editingReview ? "Sửa đánh giá thành công!" : "Cảm ơn bạn đã đánh giá!");
      mutateReviews();
      setIsModalOpen(false);
      setEditingReview(null);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteReviewByUserAction(reviewToDelete);
      if (!res.success) {
        toast.error(res.error || "Lỗi khi xóa đánh giá");
        return;
      }
      toast.success("Xóa đánh giá thành công!");
      mutateReviews();
      setReviewToDelete(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa đánh giá.");
    } finally {
      setIsDeleting(false);
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
            <span className="text-[#F5F0E8]/50 text-sm tracking-wide">Dựa trên <span className="font-medium text-[#F5F0E8]">{reviewsData?.total || 0}</span> phản hồi</span>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (!isAuthenticated) {
              setIsLoginPromptModalOpen(true);
              return;
            }
            setEditingReview(null);
            setIsModalOpen(true);
          }}
          className="relative z-10 mt-5 sm:mt-0 group flex items-center justify-center gap-2 bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] text-[#2C1810] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-500 shadow-[0_4px_15px_rgba(214,161,95,0.25)] hover:shadow-[0_8px_20px_rgba(214,161,95,0.4)] hover:-translate-y-0.5 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <PenLine className="size-3.5" />
          <span className="font-medium text-xs sm:text-sm tracking-wider uppercase">Viết Đánh Giá</span>
        </button>
      </div>

      {reviews.length === 0 ? (
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
                className={`p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-[#F5F0E8]/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-500`}
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
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                    {user && user.id === review.user_id && (
                      <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingReview(review);
                            setIsModalOpen(true);
                          }}
                          className="p-1 hover:bg-[#D6A15F]/20 rounded-md transition" 
                          title="Sửa đánh giá"
                        >
                          <Edit2 className="size-3.5 text-[#D6A15F]" />
                        </button>
                        <button 
                          onClick={() => setReviewToDelete(review.id)}
                          className="p-1 hover:bg-red-500/20 rounded-md transition" 
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="size-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
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

      {isModalOpen && (
        <ReviewFormModal 
          initialReview={editingReview}
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingReview(null);
          }} 
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Custom Confirm Modal for Deletion */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1A1A] border border-[#F5F0E8]/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-200">
            <h3 className="text-[#F5F0E8] font-serif text-xl mb-3 flex items-center gap-2">
              <Trash2 className="size-5 text-red-400" />
              Xác nhận xóa
            </h3>
            <p className="text-[#F5F0E8]/70 text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setReviewToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#F5F0E8]/70 hover:text-[#F5F0E8] hover:bg-[#F5F0E8]/5 rounded-lg transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDeleteReview}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Xóa đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------------
// MODAL COMPONENT (Internal or separated. Keeping here for cohesion if small enough)
// --------------------------------------------------------------------------------

function ReviewFormModal({ 
  initialReview,
  isOpen, 
  onClose, 
  onSubmit,
  isSubmitting 
}: { 
  initialReview?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [content, setContent] = useState(initialReview?.content || "");
  const [hoverRating, setHoverRating] = useState(0);
  
  // Image states
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialReview?.images || []);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Check total limit
    if (files.length + selectedFiles.length > 5) {
      toast.error("Chỉ được upload tối đa 5 ảnh.");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    selectedFiles.forEach((file) => {
      // Validate type
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải là hình ảnh.`);
        return;
      }
      // Validate size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá dung lượng 5MB.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    
    // Reset input value so the same file can be selected again if removed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      throw new Error("Thiếu cấu hình Cloudinary trong biến môi trường.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload ảnh thất bại");
    }

    const data = await res.json();
    
    // Auto compression parameter insertion
    // Turns: https://res.cloudinary.com/cloud/image/upload/v1234/abc.jpg
    // Into:  https://res.cloudinary.com/cloud/image/upload/q_auto,f_auto/v1234/abc.jpg
    const urlParts = data.secure_url.split('/upload/');
    return `${urlParts[0]}/upload/q_auto,f_auto/${urlParts[1]}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 3) return;
    
    let uploadedUrls: string[] = [];
    
    // Giữ lại ảnh cũ nếu có (bỏ qua những ảnh mới tải lên qua URL object)
    const oldImages = previews.filter(p => !p.startsWith("blob:"));
    uploadedUrls = [...oldImages];

    try {
      if (files.length > 0) {
        // Upload all files in parallel
        const newUrls = await Promise.all(files.map(uploadToCloudinary));
        uploadedUrls = [...uploadedUrls, ...newUrls];
      }

      await onSubmit({ rating, content, images: uploadedUrls });
      
      // Cleanup on success
      previews.forEach(p => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
      setContent("");
      setRating(5);
      setFiles([]);
      setPreviews([]);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi upload ảnh.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-[#2C1810] border border-[#D6A15F]/30 w-full max-w-lg rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#F5F0E8]/10 shrink-0">
          <h3 className="font-serif text-2xl font-light text-[#F5F0E8]">Viết đánh giá</h3>
          <button onClick={onClose} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition rounded-full p-2 hover:bg-white/5">
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[#F5F0E8]/70 text-sm">Đính kèm hình ảnh ({files.length}/5)</label>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-3">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#F5F0E8]/20 group">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {files.length < 5 && (
                  <label className="relative aspect-square border border-dashed border-[#F5F0E8]/20 rounded-xl flex flex-col items-center justify-center text-[#F5F0E8]/50 hover:bg-white/5 hover:text-[#F5F0E8]/80 hover:border-[#F5F0E8]/40 transition group cursor-pointer">
                    <ImageIcon className="size-6 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] uppercase font-medium">Thêm ảnh</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>
              <p className="text-[#F5F0E8]/40 text-xs">Chấp nhận JPG, PNG, WEBP (Tối đa 5MB/ảnh)</p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || content.trim().length < 3}
              className="w-full bg-[#D6A15F] hover:bg-[#c48d45] text-[#2C1810] font-semibold py-4 rounded-xl transition duration-300 shadow-[0_4px_15px_rgba(214,161,95,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="size-5 animate-spin" /> Đang upload ảnh & gửi đánh giá...</>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
