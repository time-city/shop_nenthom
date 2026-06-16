import NotFoundButtons from "../components/client/notFoundButtons";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F0E4] text-[#2C1810] px-6">
            {/* Self-contained float animation style */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @keyframes float-candle {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            .animate-float-candle {
              animation: float-candle 3s ease-in-out infinite;
            }
          `,
                }}
            />

            <div className="text-center max-w-lg w-full">
                {/* Error Code */}
                <div className="font-serif text-[7rem] md:text-[10rem] font-light text-[#8B7355] leading-none tracking-tight opacity-90 select-none">
                    404
                </div>

                {/* Page Title */}
                <h1 className="font-serif text-3xl md:text-5xl font-light text-[#2C1810] mt-2 mb-4">
                    Trang Không Tìm Thấy
                </h1>

                {/* Animated Illustration */}
                <div className="text-5xl md:text-6xl my-6 animate-float-candle select-none">
                    🕯️
                </div>

                {/* Error Description */}
                <p className="font-sans text-sm md:text-base text-[#6B4C35] leading-relaxed mb-8 max-w-md mx-auto">
                    Xin lỗi, trang bạn đang tìm kiếm đã bị dịch chuyển hoặc không tồn tại.
                    Hãy quay lại trang chủ hoặc khám phá các tùy chọn khác của chúng tôi.
                </p>

                {/* Action Buttons */}
                <NotFoundButtons />

                {/* Suggestions List */}
                <div className="mt-16 pt-8 border-t border-[#6B4C35]/15 text-left">
                    <h2 className="font-sans text-xs font-bold tracking-[0.1em] uppercase text-[#8B7355] mb-4">
                        Những trang phổ biến
                    </h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                        <li>
                            <a
                                href="/#home"
                                className="block p-2 text-xs text-[#2C1810] hover:text-[#6B1218] transition-all duration-200 border border-[#6B4C35]/10 rounded hover:border-[#6B1218]/30 bg-white/50"
                            >
                                Trang Chủ
                            </a>
                        </li>
                        <li>
                            <a
                                href="/#custom"
                                className="block p-2 text-xs text-[#2C1810] hover:text-[#6B1218] transition-all duration-200 border border-[#6B4C35]/10 rounded hover:border-[#6B1218]/30 bg-white/50"
                            >
                                Tùy Chỉnh
                            </a>
                        </li>
                        <li>
                            <a
                                href="/#story"
                                className="block p-2 text-xs text-[#2C1810] hover:text-[#6B1218] transition-all duration-200 border border-[#6B4C35]/10 rounded hover:border-[#6B1218]/30 bg-white/50"
                            >
                                Câu Chuyện
                            </a>
                        </li>
                        <li>
                            <a
                                href="/#contact"
                                className="block p-2 text-xs text-[#2C1810] hover:text-[#6B1218] transition-all duration-200 border border-[#6B4C35]/10 rounded hover:border-[#6B1218]/30 bg-white/50"
                            >
                                Liên Hệ
                            </a>
                        </li>
                        <li>
                            <a
                                href="/cart"
                                className="block p-2 text-xs text-[#2C1810] hover:text-[#6B1218] transition-all duration-200 border border-[#6B4C35]/10 rounded hover:border-[#6B1218]/30 bg-white/50 col-span-2 sm:col-span-1"
                            >
                                Giỏ Hàng
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
