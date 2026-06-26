"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClientProductOptionItemInterface } from "../../interface/clientInterface";
import { useToast } from "@/src/components/ui/toast-provider";
import { addToCartAction } from "../../lib/action/cart.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useCartStore } from "@/src/store/useCartStore";
import type { FormCustomProps } from "../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";


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
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <section
            id="customize"
            className="page-section fade-section bg-[#6B1218] px-4 py-4 md:py-6 lg:py-8 text-[#F5F0E8] sm:px-6 lg:px-16 min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden w-full max-w-full box-border overflow-x-hidden"
        >
            <style dangerouslySetInnerHTML={{ __html: `
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
            `}} />

            <div className="mx-auto w-full max-w-[1200px] flex flex-col lg:h-full lg:max-h-full">
                <div className="flex-none">
                    <div className="section-title font-serif text-[clamp(1.4rem,5vw,2.2rem)] font-light leading-none text-[#F5F0E8]">
                        Tạo nến của bạn
                    </div>
                    <div className="section-sub mt-1 text-[clamp(0.6rem,2vw,0.75rem)] uppercase tracking-[0.08em] text-[#F5F0E8]/62">
                        Chọn từng thành phần
                    </div>
                </div>
                <div className="configurator mt-4 lg:mt-6 flex flex-row flex-nowrap gap-2 sm:gap-4 lg:gap-8 rounded-2xl bg-[#2C1810] p-2 sm:p-5 text-[#F5F0E8] shadow-[0_18px_50px_rgba(44,24,16,0.22)] lg:flex-initial lg:max-h-[calc(100vh-180px)] h-fit w-full overflow-hidden">
                    <div className="config-panel flex flex-col gap-3 sm:gap-4 w-1/2 shrink-0 lg:overflow-y-auto lg:pr-3 scrollbar-custom lg:max-h-full">
                        <h3 className="text-[clamp(9px,2vw,0.7rem)] uppercase tracking-[0.15em] text-[#F5F0E8] font-semibold opacity-70">
                            Thành phần tùy chỉnh
                        </h3>
                        <div className="option-group">
                            <div className="option-label mb-1.5 text-[clamp(9px,2.2vw,12px)] text-[#F5F0E8]/78">
                                Hương liệu
                            </div>
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
                                            onClick={() => setSelectedScentId(scent.id)}
                                            className={`opt scent-chip inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border px-1.5 py-1 sm:px-3 sm:py-1.5 text-[clamp(9px,2.2vw,12px)] tracking-[0.03em] transition ${active
                                                ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                                                : "border-[#F5F0E8]/25 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            <span
                                                className="size-1.5 sm:size-2 rounded-full bg-[#F5F0E8]/75 shadow-[0_0_10px_rgba(245,240,232,0.25)]"
                                            />
                                            {scent.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="option-group">
                            <div className="option-label mb-1.5 text-[clamp(9px,2.2vw,12px)] text-[#F5F0E8]/78">
                                Màu sáp
                            </div>
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
                                            onClick={() => setSelectedColorId(color.id)}
                                            title={color.name}
                                            style={{ backgroundColor: colorHex }}
                                            className={`color-dot size-5 sm:size-7 rounded-full border-2 shadow-[0_4px_10px_rgba(0,0,0,0.14)] transition hover:scale-110 ${active
                                                ? "scale-105 border-[#F5F0E8]"
                                                : "border-transparent"
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className="option-group">
                            <div className="option-label mb-1.5 text-[clamp(9px,2.2vw,12px)] text-[#F5F0E8]/78">
                                Kích thước
                            </div>
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
                                            onClick={() => setSelectedSizeId(size.id)}
                                            className={`opt rounded-lg border px-1.5 py-1 sm:px-3 sm:py-1.5 text-[clamp(9px,2.2vw,12px)] tracking-[0.03em] transition ${active
                                                ? "border-[#F5F0E8] bg-[#F5F0E8] font-semibold text-[#6B1218] shadow-[0_6px_14px_rgba(107,18,24,0.1)]"
                                                : "border-[#F5F0E8]/30 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            {getSizeLabel(size)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="option-group">
                            <div className="option-label mb-1.5 text-[clamp(9px,2.2vw,12px)] text-[#F5F0E8]/78">
                                Bao bì
                            </div>
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
                                            onClick={() => setSelectedPackId(pack.id)}
                                            className={`opt rounded-lg border px-1.5 py-1 sm:px-3 sm:py-1.5 text-[clamp(9px,2.2vw,12px)] tracking-[0.03em] transition ${active
                                                ? "border-[#F5F0E8] bg-[#F5F0E8] font-semibold text-[#6B1218]"
                                                : "border-[#F5F0E8]/30 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            {pack.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="option-group">
                            <div className="option-label mb-1.5 text-[clamp(9px,2.2vw,12px)] text-[#F5F0E8]/78">
                                Topping
                            </div>
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
                                            className={`opt topping-chip inline-flex items-center gap-0.5 sm:gap-1 rounded-lg border px-1.5 py-1 sm:px-3 sm:py-1.5 text-[clamp(9px,2.2vw,12px)] tracking-[0.03em] transition ${active
                                                ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                                                : "border-[#F5F0E8]/25 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            <span className="topping-check w-2 sm:w-3 text-center text-[clamp(7px,2vw,10px)]">
                                                {active ? "☑" : "☐"}
                                            </span>
                                            {topping.name}
                                            {topping.price_extra_cents > 0 ? (
                                                <span className="text-[#F5F0E8]/65 ml-0.5">
                                                    +{formatPrice(topping.price_extra_cents)}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2 shrink-0 pl-1 sm:pl-0 self-stretch justify-between">
                        <div className="preview-box flex flex-col flex-1 rounded-2xl bg-[#F5F0E8] pt-5 pb-2 px-2 sm:p-4 md:p-5 lg:p-5 overflow-y-auto scrollbar-custom-dark">
                            <div
                                style={{ backgroundColor: selectedColorHex }}
                                className="mini-candle relative mx-auto mt-6 mb-1 h-[70px] w-[40px] sm:h-[95px] sm:w-[56px] rounded-[4px_4px_2px_2px] shadow-[inset_-6px_0_12px_rgba(0,0,0,0.1),inset_2px_0_6px_rgba(255,255,255,0.3),0_12px_26px_rgba(44,24,16,0.15)] transition"
                            >
                                <div className="custom-wick" />
                                <div className="custom-flame" />
                            </div>
                            <div
                                className="preview-name mt-1 font-serif text-[clamp(12px,3.5vw,1.35rem)] font-semibold text-[#6B1218] leading-tight"
                                id="prev-name"
                            >
                                {selectedScent?.name ?? "Chưa chọn hương"}
                            </div>
                            <div
                                className="preview-desc mb-1 text-[clamp(9px,2.5vw,0.78rem)] font-light italic text-[#8a6f5e]"
                                id="prev-desc"
                            >
                                {getScentDescription(selectedScent)}
                            </div>
                            <div className="preview-divider my-1 sm:my-2 h-px w-full bg-[#6B1218]/15" />
                            <div className="preview-details w-full text-[clamp(9px,2.2vw,0.78rem)] leading-4 sm:leading-6 text-[#2C1810]">
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium">Kích thước:</span>
                                    <span id="prev-size">
                                        {selectedSize ? getSizeLabel(selectedSize) : "Chưa chọn"}
                                    </span>
                                </div>
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium">Màu sáp:</span>
                                    <span id="prev-color">{selectedColor?.name ?? "Chưa chọn"}</span>
                                </div>
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium">Bao bì:</span>
                                    <span id="prev-pack">{selectedPack?.name ?? "Chưa chọn"}</span>
                                </div>
                            </div>
                            <div className="preview-divider my-1 sm:my-2 h-px w-full bg-[#6B1218]/15" />

                            <div className="preview-toppings my-1 w-full" id="preview-toppings">
                                <div className="topping-list flex flex-wrap gap-1 sm:gap-1.5" id="topping-list">
                                    {selectedToppings.length === 0 ? (
                                        <div className="no-topping text-[clamp(9px,2.2vw,0.78rem)] italic text-[#a89080]">
                                            Chưa chọn topping
                                        </div>
                                    ) : (
                                        toppingOptions
                                            .filter((topping) => selectedToppings.includes(topping.id))
                                            .map((topping) => (
                                                <span
                                                    key={topping.id}
                                                    className="topping-tag rounded-full bg-[#6B1218]/15 px-1.5 py-0.5 text-[clamp(8px,2vw,0.72rem)] font-medium text-[#6B1218]"
                                                >
                                                    {topping.name}
                                                </span>
                                            ))
                                    )}
                                </div>
                            </div>

                            <div className="preview-divider my-1 sm:my-2 h-px w-full bg-[#6B1218]/15 mt-auto" />

                            <div
                                className="preview-price-breakdown w-full pt-1 sm:pt-1.5 text-[clamp(9px,2.2vw,0.78rem)] text-[#2C1810]"
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
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#2C1810]/65">
                                        <span>{selectedSize.name}:</span>
                                        <span>+{formatPrice(selectedSize.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                {selectedScent?.price_extra_cents ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#2C1810]/65">
                                        <span>{selectedScent.name}:</span>
                                        <span>+{formatPrice(selectedScent.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                {selectedColor?.price_extra_cents ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#2C1810]/65">
                                        <span>{selectedColor.name}:</span>
                                        <span>+{formatPrice(selectedColor.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                {selectedPack?.price_extra_cents ? (
                                    <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5 text-[#2C1810]/65">
                                        <span>{selectedPack.name}:</span>
                                        <span>+{formatPrice(selectedPack.price_extra_cents)}</span>
                                    </div>
                                ) : null}
                                <div className="price-line flex justify-between gap-3 leading-4 sm:leading-5">
                                    <span>Topping:</span>
                                    <span>{formatPrice(toppingTotal)}</span>
                                </div>
                                <div className="price-total mt-1 sm:mt-2 flex justify-between gap-3 border-t border-[#6B1218]/20 pt-1 sm:pt-2 font-serif text-[clamp(14px,3.5vw,1.2rem)] font-semibold text-[#6B1218]">
                                    <span>Tổng:</span>
                                    <span id="price-display">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="price-row mt-2 sm:mt-4 flex flex-col gap-2 border-t border-[#F5F0E8]/20 pt-2 sm:pt-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="add-btn w-full rounded-full bg-[#6B1218] px-2 sm:px-6 py-2 sm:py-3 text-[clamp(9px,2.2vw,0.75rem)] font-medium uppercase tracking-[0.1em] text-[#F5F0E8] shadow-[0_6px_20px_rgba(107,18,24,0.25)] transition hover:bg-[#4A0C10] hover:shadow-[0_10px_28px_rgba(107,18,24,0.4)] disabled:cursor-not-allowed disabled:opacity-65"
                            >
                                {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                            </button>
                            {cartError && (
                                <p className="mt-1 text-xs font-medium text-[#6B1218]">
                                    {cartError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}




