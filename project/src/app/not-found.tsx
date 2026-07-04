import Link from "next/link";
import NotFoundButtons from "@/src/components/client/common/notFoundButtons";

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/option_background.jpg')" }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @keyframes page-enter {
              0% { opacity: 0; transform: translateY(24px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-page-enter {
              animation: page-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `,
                }}
            />

            <div className="animate-page-enter relative z-10 w-full max-w-lg text-center opacity-0">
                {/* Studio label */}
                <p className="mb-3 text-[0.68rem] uppercase tracking-[0.22em] text-[#F5F0E8]/60">
                    ChamCham Studio
                </p>

                {/* Error Code */}
                <div className="font-serif text-[8rem] md:text-[10rem] font-light text-[#F5F0E8] leading-none tracking-tight opacity-90 select-none">
                    404
                </div>

                {/* Page Title */}
                <h1 className="font-serif text-2xl md:text-4xl font-light text-[#F5F0E8] mt-2 mb-4">
                    Trang Không Tìm Thấy
                </h1>


                {/* Error Description */}
                <p className="font-sans text-sm text-[#F5F0E8]/75 leading-relaxed mb-8 max-w-md mx-auto">
                    Xin lỗi, trang bạn đang tìm kiếm đã bị dịch chuyển hoặc không tồn tại.
                    Hãy quay lại trang chủ hoặc khám phá các tùy chọn khác của chúng tôi.
                </p>

                {/* Action Buttons */}
                <NotFoundButtons />

                {/* Suggestions List */}
                <div className="mt-10 pt-7 border-t border-white/20 text-left">
                    <h2 className="font-sans text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#F5F0E8]/50 mb-4">
                        Những trang phổ biến
                    </h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                        <li>
                            <Link href="/#home" className="block p-2 text-xs text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all duration-200 border border-white/20 rounded-xl hover:border-white/50 hover:bg-white/10">
                                Trang Chủ
                            </Link>
                        </li>
                        <li>
                            <Link href="/#custom" className="block p-2 text-xs text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all duration-200 border border-white/20 rounded-xl hover:border-white/50 hover:bg-white/10">
                                Tùy Chỉnh
                            </Link>
                        </li>
                        <li>
                            <Link href="/#story" className="block p-2 text-xs text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all duration-200 border border-white/20 rounded-xl hover:border-white/50 hover:bg-white/10">
                                Câu Chuyện
                            </Link>
                        </li>
                        <li>
                            <Link href="/#contact" className="block p-2 text-xs text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all duration-200 border border-white/20 rounded-xl hover:border-white/50 hover:bg-white/10">
                                Liên Hệ
                            </Link>
                        </li>
                        <li>
                            <Link href="/cart" className="block p-2 text-xs text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all duration-200 border border-white/20 rounded-xl hover:border-white/50 hover:bg-white/10 col-span-2 sm:col-span-1">
                                Giỏ Hàng
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
