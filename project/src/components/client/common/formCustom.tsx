"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClientProductOptionItemInterface } from "../../../interface/clientInterface";
import { useToast } from "@/src/components/ui/toastProvider";
import { addToCartAction } from "../../../lib/action/cart.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { mutate } from "swr";
import { useCartStore } from "@/src/store/useCartStore";
import type { FormCustomProps } from "../../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";
import optionBgImage from "@/public/assets/option_background.jpg";


const customBasePrice = 189000;
const emptyOptions: ClientProductOptionItemInterface[] = [];


const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";


const getSizeLabel = (size: ClientProductOptionItemInterface) =>
    size.weight_gram ? `${size.name} — ${size.weight_gram}g` : size.name;

const getScentDescription = (scent?: ClientProductOptionItemInterface) =>
    scent
        ? `Hương ${scent.name} được chọn cho nến tùy chỉnh của bạn`
        : "Chưa chọn hương thơm";
const getColorHex = (color?: ClientProductOptionItemInterface) =>
    color?.hex_code ?? "#F5E6D3";
export default function FormCustom({
    basePrice = customBasePrice,
    options,
}: FormCustomProps) {
    const { toast } = useToast();
    const incrementCartCount = useCartStore((state) => state.incrementCartCount);
    const scentOptions = options?.scents ?? emptyOptions;
    const colorOptions = options?.colors ?? emptyOptions;
    const sizeOptions = options?.sizes ?? emptyOptions;
    const packOptions = options?.packagings ?? emptyOptions;
    const toppingOptions = options?.toppings ?? emptyOptions;

    const [selectedScentId, setSelectedScentId] = useState(scentOptions[0]?.id ?? 0);
    const [selectedColorId, setSelectedColorId] = useState(colorOptions[0]?.id ?? 0);
    const [selectedSizeId, setSelectedSizeId] = useState(sizeOptions[0]?.id ?? 0);
    const [selectedPackId, setSelectedPackId] = useState(packOptions[0]?.id ?? 0);
    const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [stepDirection, setStepDirection] = useState<1 | -1>(1);

    const selectedScent =
        scentOptions.find((item) => item.id === selectedScentId) ?? scentOptions[0];
    const selectedColor =
        colorOptions.find((item) => item.id === selectedColorId) ?? colorOptions[0];
    const selectedSize =
        sizeOptions.find((item) => item.id === selectedSizeId) ?? sizeOptions[0];
    const selectedPack =
        packOptions.find((item) => item.id === selectedPackId) ?? packOptions[0];
    const selectedColorHex = getColorHex(selectedColor);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            if (!scentOptions.some((item) => item.id === selectedScentId)) {
                setSelectedScentId(scentOptions[0]?.id ?? 0);
            }

            if (!colorOptions.some((item) => item.id === selectedColorId)) {
                setSelectedColorId(colorOptions[0]?.id ?? 0);
            }

            if (!sizeOptions.some((item) => item.id === selectedSizeId)) {
                setSelectedSizeId(sizeOptions[0]?.id ?? 0);
            }

            if (!packOptions.some((item) => item.id === selectedPackId)) {
                setSelectedPackId(packOptions[0]?.id ?? 0);
            }


            setSelectedToppings((currentToppings) => {
                const nextToppings = currentToppings.filter((id) =>
                    toppingOptions.some((topping) => topping.id === id),
                );

                return nextToppings.length === currentToppings.length
                    ? currentToppings
                    : nextToppings;
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [
        colorOptions,
        packOptions,
        scentOptions,
        selectedColorId,
        selectedPackId,
        selectedScentId,
        selectedSizeId,
        sizeOptions,
        toppingOptions,
    ]);

    const toppingTotal = useMemo(
        () =>
            toppingOptions
                .filter((item) => selectedToppings.includes(item.id))
                .reduce((sum, item) => sum + item.price_extra_cents, 0),
        [selectedToppings, toppingOptions],
    );

    const optionTotal =
        (selectedScent?.price_extra_cents ?? 0) +
        (selectedColor?.price_extra_cents ?? 0) +
        (selectedSize?.price_extra_cents ?? 0) +
        (selectedPack?.price_extra_cents ?? 0);
    const totalPrice = basePrice + optionTotal + toppingTotal;

    const toggleTopping = (id: number) => {
        setSelectedToppings((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };
    const goToStep = (nextStep: number) => {
        const targetStep = Math.max(1, Math.min(5, nextStep));
        setStepDirection(targetStep >= currentStep ? 1 : -1);
        setCurrentStep(targetStep);
    };
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");

    const handleAddToCart = async () => {
        if (isAddingToCart) return;
        setCartError("");
        setIsAddingToCart(true);
        try {
            // action-(thêm nến tùy chỉnh vào giỏ hàng)
            const result = await callAction(() => addToCartAction({
                color_id: selectedColor?.id,
                pack_id: selectedPack?.id,
                quantity: 1,
                scent_id: selectedScent?.id,
                size_id: selectedSize?.id,
                toppings_json: selectedToppings,
            }), "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");

            if ("error" in result && result.error) {
                setCartError(getFriendlyResponseError(result.error));
                return;
            }

            toast.success("Đã thêm nến tùy chỉnh vào giỏ hàng");
            // Cập nhật badge số lượng trên header
            incrementCartCount(1);
            
            void mutate(["client-cart"]);
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <section
            id="customize"
            className="page-section fade-section relative px-4 py-8 md:py-12 lg:py-8 text-[#F5F0E8] sm:px-6 lg:px-16 lg:min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col lg:justify-center overflow-hidden w-full max-w-full box-border overflow-x-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/rose_bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-[#2b060c]/82" />
            <div className="relative z-10 w-full h-full flex flex-col lg:justify-center">
            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-custom::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .scrollbar-custom::-webkit-scrollbar-track {
                    background: rgba(245, 240, 232, 0.03);
                    border-radius: 3px;
                }
                .scrollbar-custom::-webkit-scrollbar-thumb {
                    background: rgba(245, 240, 232, 0.15);
                    border-radius: 3px;
                }
                .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                    background: rgba(245, 240, 232, 0.35);
                }

                .scrollbar-custom-dark::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .scrollbar-custom-dark::-webkit-scrollbar-track {
                    background: rgba(107, 18, 24, 0.03);
                    border-radius: 3px;
                }
                .scrollbar-custom-dark::-webkit-scrollbar-thumb {
                    background: rgba(107, 18, 24, 0.15);
                    border-radius: 3px;
                }
                .scrollbar-custom-dark::-webkit-scrollbar-thumb:hover {
                    background: rgba(107, 18, 24, 0.35);
                }

                .custom-wick {
                    position: absolute;
                    top: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 2px;
                    height: 8px;
                    background-color: #2C1810;
                    z-index: 10;
                }
                .custom-flame {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 12px;
                    height: 20px;
                    border-radius: 50% 50% 35% 35%;
                    background: radial-gradient(ellipse at 50% 80%, #fff 0%, #FFE566 35%, #FF9A00 70%, transparent 100%);
                    animation: custom-flicker 1.2s ease-in-out infinite;
                    z-index: 15;
                }
                @keyframes custom-flicker {
                    0%, 100% {
                        transform: translateX(-50%) scale(1);
                    }
                    25% {
                        transform: translateX(-50%) scaleX(0.85) scaleY(1.08);
                    }
                    50% {
                        transform: translateX(-50%) scaleX(1.1) scaleY(0.92);
                    }
                    75% {
                        transform: translateX(-50%) scaleX(0.9) scaleY(1.05);
                    }
                }

                .step-transition {
                    animation-duration: 560ms;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                    animation-fill-mode: both;
                    will-change: opacity, transform;
                }
                .step-transition.step-next {
                    animation-name: step-fade-next;
                }
                .step-transition.step-prev {
                    animation-name: step-fade-prev;
                }
                @keyframes step-fade-next {
                    from {
                        opacity: 0;
                        transform: translateX(12px) scale(0.99);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                @keyframes step-fade-prev {
                    from {
                        opacity: 0;
                        transform: translateX(-12px) scale(0.99);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
            `}} />

            <div className="mx-auto w-full max-w-[1200px] flex flex-col lg:h-full lg:max-h-full">
                <div className="flex-none">
                    <div data-aos="fade-up" className="section-title font-serif text-[clamp(1.6rem,5vw,2.5rem)] font-medium tracking-wide leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                        Tạo nến của bạn
                    </div>
                    <div data-aos="fade-up" data-aos-delay="100" className="flex items-center gap-3 mt-3">
                        <span className="h-[1.5px] w-12 bg-gradient-to-r from-[#E5C07B] to-transparent opacity-80"></span>
                        <div className="section-sub text-[clamp(0.85rem,2vw,1rem)] font-light italic tracking-wider text-[#F5E6D3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            Khám phá hương thơm theo cách của bạn
                        </div>
                    </div>
                </div>
                <div
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="configurator mt-4 lg:mt-6 flex flex-col md:flex-row flex-nowrap gap-3 sm:gap-4 md:gap-4 lg:gap-6 rounded-2xl border border-white/15 bg-[#3E0D14] p-3 sm:p-5 text-[#F5F0E8] shadow-[0_24px_56px_rgba(0,0,0,0.34)] md:flex-initial md:max-h-[calc(100vh-150px)] h-fit w-full md:overflow-hidden overflow-y-auto relative"
                >
                    <div className="config-panel flex flex-col gap-3 sm:gap-4 flex-none w-full md:w-[280px] lg:w-[340px] xl:w-[380px] min-w-0 rounded-xl border border-white/12 bg-[#4A1118] pl-2 sm:pl-3 py-1 sm:py-2 md:pr-2 lg:pr-3 scrollbar-custom md:max-h-full relative z-10 shrink-0 md:overflow-y-auto">
                        <div className="stepper-header flex items-center justify-between border-b border-white/20 pb-2 mb-2 shrink-0">
                            <h3 className="text-[clamp(10px,2vw,0.75rem)] uppercase tracking-[0.15em] text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {currentStep === 1 && "1. Chọn Hương Liệu"}
                                {currentStep === 2 && "2. Chọn Màu Sáp"}
                                {currentStep === 3 && "3. Chọn Kích Thước"}
                                {currentStep === 4 && "4. Chọn Bao Bì"}
                                {currentStep === 5 && "5. Chọn Topping"}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map(step => (
                                    <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${step === currentStep ? 'w-4 bg-white' : step < currentStep ? 'w-1.5 bg-white/60' : 'w-1.5 bg-white/20'}`} />
                                ))}
                            </div>
                        </div>

                        {currentStep === 1 && (
                        <div className={`option-group step-transition ${stepDirection === 1 ? "step-next" : "step-prev"}`}>
                            <div className="options flex flex-wrap gap-1 sm:gap-2" id="scent-opts">
                                {scentOptions.length === 0 ? (
                                    <p className="text-xs text-[#F5F0E8]/65">
                                        Chưa có hương thơm để chọn
                                    </p>
                                ) : null}
                                {scentOptions.map((scent) => {
                                    const active = selectedScent?.id === scent.id;
                                    return (
                                        <button
                                            key={scent.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedScentId(scent.id);
                                                setTimeout(() => goToStep(2), 250);
                                            }}
                                            className={`opt scent-chip flex flex-col justify-center rounded-xl border p-2 sm:p-2.5 text-left transition-all duration-300 ${active
                                                ? "border-white/35 bg-[#7A4C52] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                                                : "border-white/10 bg-[#4A2329] text-white/75 hover:bg-[#5A2D34] hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            <span className="font-serif text-[clamp(11px,2.2vw,14px)]">{scent.name}</span>
                                            {scent.price_extra_cents > 0 ? (
                                                <span className="text-[10px] sm:text-xs opacity-70 mt-1">+{formatPrice(scent.price_extra_cents)}</span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {currentStep === 2 && (
                        <div className={`option-group step-transition ${stepDirection === 1 ? "step-next" : "step-prev"}`}>
                            <div className="color-opts flex flex-wrap gap-1 sm:gap-2.5" id="color-opts">
                                {colorOptions.length === 0 ? (
                                    <p className="text-xs text-[#F5F0E8]/65">
                                        Chưa có màu sáp để chọn
                                    </p>
                                ) : null}
                                {colorOptions.map((color) => {
                                    const active = selectedColor?.id === color.id;
                                    const colorHex = getColorHex(color);

                                    return (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedColorId(color.id);
                                                setTimeout(() => goToStep(3), 250);
                                            }}
                                            title={color.name}
                                            style={{ backgroundColor: colorHex }}
                                            className={`color-dot relative flex items-center justify-center size-6 sm:size-8 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer ${active
                                                ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/20"
                                                : "hover:scale-105 opacity-80 hover:opacity-100"
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {currentStep === 3 && (
                        <div className={`option-group step-transition ${stepDirection === 1 ? "step-next" : "step-prev"}`}>
                            <div className="options flex flex-wrap gap-1 sm:gap-2" id="size-opts">
                                {sizeOptions.length === 0 ? (
                                    <p className="text-xs text-[#F5F0E8]/65">
                                        Chưa có kích thước để chọn
                                    </p>
                                ) : null}
                                {sizeOptions.map((size) => {
                                    const active = selectedSize?.id === size.id;
                                    return (
                                        <button
                                            key={size.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedSizeId(size.id);
                                                setTimeout(() => goToStep(4), 250);
                                            }}
                                            className={`opt rounded-xl border p-1.5 sm:p-2 sm:px-3 text-[clamp(10px,2vw,13px)] tracking-wide transition-all duration-300 ${active
                                                ? "border-white/35 bg-[#7A4C52] font-medium text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                                                : "border-white/10 bg-[#4A2329] text-white/75 hover:bg-[#5A2D34] hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            {getSizeLabel(size)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {currentStep === 4 && (
                        <div className={`option-group step-transition ${stepDirection === 1 ? "step-next" : "step-prev"}`}>
                            <div className="options flex flex-wrap gap-1 sm:gap-2" id="pack-opts">
                                {packOptions.length === 0 ? (
                                    <p className="text-xs text-[#F5F0E8]/65">
                                        Chưa có bao bì để chọn
                                    </p>
                                ) : null}
                                {packOptions.map((pack) => {
                                    const active = selectedPack?.id === pack.id;
                                    return (
                                        <button
                                            key={pack.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPackId(pack.id);
                                                setTimeout(() => goToStep(5), 250);
                                            }}
                                            className={`opt rounded-xl border p-1.5 sm:p-2 sm:px-3 text-[clamp(10px,2vw,13px)] tracking-wide transition-all duration-300 ${active
                                                ? "border-white/35 bg-[#7A4C52] font-medium text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                                                : "border-white/10 bg-[#4A2329] text-white/75 hover:bg-[#5A2D34] hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            {pack.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {currentStep === 5 && (
                        <div className={`option-group step-transition ${stepDirection === 1 ? "step-next" : "step-prev"}`}>
                            <div className="options flex flex-wrap gap-1 sm:gap-2" id="topping-opts">
                                {toppingOptions.length === 0 ? (
                                    <p className="text-xs text-[#F5F0E8]/65">
                                        Chưa có topping để chọn
                                    </p>
                                ) : null}
                                {toppingOptions.map((topping) => {
                                    const active = selectedToppings.includes(topping.id);
                                    return (
                                        <button
                                            key={topping.id}
                                            type="button"
                                            onClick={() => toggleTopping(topping.id)}
                                            className={`opt topping-chip inline-flex items-center gap-1.5 rounded-xl border p-1.5 sm:p-2 sm:px-3 text-[clamp(10px,2vw,13px)] tracking-wide transition-all duration-300 ${active
                                                ? "border-white/35 bg-[#7A4C52] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                                                : "border-white/10 bg-[#4A2329] text-white/75 hover:bg-[#5A2D34] hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            <div className={`flex items-center justify-center size-4 rounded-full border ${active ? 'border-white bg-white/30 text-white' : 'border-white/30'}`}>
                                                {active && <span className="text-[10px] leading-none">✓</span>}
                                            </div>
                                            {topping.name}
                                            {topping.price_extra_cents > 0 ? (
                                                <span className="text-white/60 ml-0.5 text-xs">
                                                    +{formatPrice(topping.price_extra_cents)}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        <div className="step-nav mt-auto pt-4 flex gap-3 z-20 sticky bottom-0">
                            <button
                                type="button"
                                onClick={() => goToStep(currentStep - 1)}
                                disabled={currentStep === 1}
                                className={`flex-1 rounded-xl border border-white/20 bg-[#4A2329] py-2 sm:py-2.5 text-[10px] sm:text-[12px] font-medium uppercase tracking-wider text-white transition-all duration-300 ${currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#5A2D34]'}`}
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={() => goToStep(currentStep + 1)}
                                disabled={currentStep === 5}
                                className={`flex-1 rounded-xl border py-2 sm:py-2.5 text-[10px] sm:text-[12px] font-medium uppercase tracking-wider transition-all duration-300 ${currentStep === 5 ? 'opacity-30 cursor-not-allowed border-white/20 bg-[#4A2329] text-white' : 'border-white/35 bg-[#7A4C52] text-white hover:bg-[#8A5B61] shadow-[0_8px_18px_rgba(0,0,0,0.25)]'}`}
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 w-full md:w-auto min-w-0 self-stretch justify-center items-center rounded-xl border border-white/15 bg-[#4A1118] p-4 md:p-5 lg:p-6 py-6 md:py-8 lg:py-10 shadow-[0_20px_45px_rgba(0,0,0,0.3)] relative">
                        <div
                            className="mini-candle shrink-0 relative mx-auto mb-4 h-[100px] w-[60px] sm:h-[130px] sm:w-[80px] rounded-[6px_6px_3px_3px] transition-all duration-700 ease-in-out"
                            style={{
                                backgroundColor: selectedColorHex,
                                boxShadow: `
                                    inset -10px 0 16px rgba(0,0,0,0.4),
                                    inset 8px 0 12px rgba(255,255,255,0.2),
                                    0 20px 40px rgba(0,0,0,0.5)
                                `,
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-[10px] sm:h-[14px] -translate-y-1/2 rounded-[50%] bg-black/15 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-white/10" />
                            
                            <div className="absolute -top-3 sm:-top-5 left-1/2 h-3 sm:h-5 w-[2px] sm:w-[3px] -translate-x-1/2 bg-gradient-to-b from-[#222] to-[#555] rounded-t-full z-10">
                                <div className="absolute -top-5 sm:-top-7 left-1/2 h-5 sm:h-7 w-2.5 sm:w-3.5 -translate-x-1/2 rounded-[50%_50%_20%_20%] bg-gradient-to-t from-[#ff9d00] via-[#ffdb58] to-transparent shadow-[0_0_10px_#ff9d00,0_0_20px_#ffdb58,0_0_40px_#ff9d00] animate-pulse mix-blend-screen" />
                            </div>
                        </div>
                        <div className="text-center mt-4 sm:mt-6 z-10 w-full">
                            <h4 className="font-serif text-[clamp(1.4rem,3vw,2rem)] text-white font-medium tracking-wide drop-shadow-md">
                                {selectedScent?.name ?? "Nến Tùy Chỉnh"}
                            </h4>
                            <p className="text-[clamp(11px,1.5vw,14px)] italic text-white/70 mt-2 font-light">
                                {getScentDescription(selectedScent)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col flex-none w-full md:w-[250px] lg:w-[300px] xl:w-[340px] min-w-0 self-stretch justify-between gap-2 sm:gap-4 md:h-auto shrink-0">
                        <div className="preview-info-box flex flex-col flex-1 rounded-xl border border-white/15 bg-[#4A1118] p-4 md:p-5 overflow-y-auto scrollbar-custom-dark shadow-[0_24px_48px_rgba(0,0,0,0.32)]">
                            <h4 className="text-[clamp(10px,1.5vw,0.75rem)] uppercase tracking-[0.15em] text-[#F5F0E8] font-bold opacity-90 mb-3 sm:mb-4 border-b border-white/20 pb-2">
                                Chi tiết tùy chỉnh
                            </h4>
                            <div className="preview-details w-full text-[clamp(10px,1.8vw,0.85rem)] leading-5 sm:leading-6 text-[#F5F0E8]/90">
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium text-[#F5F0E8]/75">Kích thước:</span>
                                    <span id="prev-size">
                                        {selectedSize ? getSizeLabel(selectedSize) : "Chưa chọn"}
                                    </span>
                                </div>
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium text-[#F5F0E8]/75">Màu sáp:</span>
                                    <span id="prev-color">{selectedColor?.name ?? "Chưa chọn"}</span>
                                </div>
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium text-[#F5F0E8]/75">Bao bì:</span>
                                    <span id="prev-pack">{selectedPack?.name ?? "Chưa chọn"}</span>
                                </div>
                            </div>
                            <div className="preview-divider my-1 sm:my-2 h-px w-full bg-[#F5F0E8]/15" />

                            <div className="preview-toppings my-1 w-full" id="preview-toppings">
                                <div className="topping-list flex flex-wrap gap-1 sm:gap-1.5" id="topping-list">
                                    {selectedToppings.length === 0 ? (
                                        <div className="no-topping text-[clamp(9px,2.2vw,0.78rem)] italic text-[#F5F0E8]/50">
                                            Chưa chọn topping
                                        </div>
                                    ) : (
                                        toppingOptions
                                            .filter((topping) => selectedToppings.includes(topping.id))
                                            .map((topping) => (
                                                <span
                                                    key={topping.id}
                                                    className="topping-tag rounded-full bg-[#F5F0E8]/15 px-1.5 py-0.5 text-[clamp(8px,2vw,0.72rem)] font-medium text-[#F5F0E8]"
                                                >
                                                    {topping.name}
                                                </span>
                                            ))
                                    )}
                                </div>
                            </div>

                            <div className="preview-divider my-1 sm:my-2 h-px w-full bg-[#F5F0E8]/15 mt-auto" />

                            <div
                                className="preview-price-breakdown w-full pt-1 sm:pt-1.5 text-[clamp(9px,2.2vw,0.78rem)] text-[#F5F0E8]"
                                id="price-breakdown"
                            >
                                <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5">
                                    <span>Nến cơ bản:</span>
                                    <span>{formatPrice(basePrice)}</span>
                                </div>
                                {optionTotal > 0 ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5">
                                        <span>Tùy chọn:</span>
                                        <span>{formatPrice(optionTotal)}</span>
                                    </div>
                                ) : null}
                                {selectedSize ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#F5F0E8]/65">
                                        <span>{selectedSize.name}:</span>
                                        <span>+{formatPrice(selectedSize.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                {selectedScent?.price_extra_cents ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#F5F0E8]/65">
                                        <span>{selectedScent.name}:</span>
                                        <span>+{formatPrice(selectedScent.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                {selectedColor?.price_extra_cents ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#F5F0E8]/65">
                                        <span>{selectedColor.name}:</span>
                                        <span>+{formatPrice(selectedColor.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                {selectedPack?.price_extra_cents ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#F5F0E8]/65">
                                        <span>{selectedPack.name}:</span>
                                        <span>+{formatPrice(selectedPack.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#F5F0E8]/90">
                                    <span>Topping:</span>
                                    <span>{formatPrice(toppingTotal)}</span>
                                </div>
                                {/* Total price is now displayed in the action bar */}
                            </div>
                        </div>
                        <div className="price-row mt-2 sm:mt-4 flex flex-col gap-2 rounded-xl border border-white/20 bg-[#5A1D25] p-3 sm:p-4 shadow-[0_18px_40px_rgba(0,0,0,0.3)] shrink-0 z-20">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-white/80 text-[10px] sm:text-xs font-medium uppercase tracking-widest">Tổng đơn hàng</span>
                                <span className="font-serif text-[clamp(1.2rem,3vw,1.6rem)] font-bold text-white leading-none drop-shadow-md" id="price-display">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="add-btn w-full rounded-xl bg-white text-[#3A080B] px-4 py-2 sm:py-3 text-[clamp(11px,2.2vw,13px)] font-bold uppercase tracking-[0.15em] shadow-[0_4px_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-[#F5F0E8] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-65"
                            >
                                {isAddingToCart ? "Đang xử lý..." : "Thêm vào giỏ"}
                            </button>
                            {cartError && (
                                <p className="mt-2 text-xs font-medium text-red-300 text-center">
                                    {cartError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </section>
    );
}




