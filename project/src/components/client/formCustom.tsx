"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";

const scents = [
    {
        name: "Santal 33",
        desc: "Gỗ đàn hương, da thuộc, sang trọng",
        color: "#D4A574",
    },
    {
        name: "Aquamarine",
        desc: "Biển xanh, tươi mát, khoáng đạt",
        color: "#7EC8C8",
    },
    {
        name: "Orchid & Sea Salt",
        desc: "Hoa lan quyến rũ, muối biển nhẹ nhàng",
        color: "#C9A0C0",
    },
    {
        name: "Oakmoss Amber",
        desc: "Rêu rừng, hổ phách ấm, trầm sâu",
        color: "#8B7355",
    },
    {
        name: "Incense Villages",
        desc: "Trầm hương làng cổ, khói nhẹ, hoài niệm",
        color: "#C4956A",
    },
    {
        name: "Campfire",
        desc: "Lửa trại, gỗ cháy, khói thông",
        color: "#C4622A",
    },
];

const waxColors = [
    { name: "Kem", value: "#F5ECD8" },
    { name: "Mật ong", value: "#E8C878" },
    { name: "Hồng phấn", value: "#E8B4A0" },
    { name: "Đỏ hồng", value: "#C87878" },
    { name: "Nâu đất", value: "#A07850" },
    { name: "Đen khói", value: "#3C2820" },
];

const sizes = [
    { label: "S — 100g", price: 189000 },
    { label: "M — 200g", price: 289000 },
    { label: "L — 350g", price: 429000 },
];

const packs = ["Hộp trắng", "Hộp đen", "Không hộp"];

const toppings = [
    { name: "Socola", price: 15000 },
    { name: "Trái tim lớn", price: 20000 },
    { name: "Trái tim vừa", price: 15000 },
    { name: "Trái tim nhỏ", price: 10000 },
    { name: "Hoa hồng khô", price: 25000 },
    { name: "Hoa mẫu đơn khô", price: 25000 },
    { name: "Strawberry sấy", price: 20000 },
    { name: "Việt quất sấy", price: 20000 },
];

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

export default function FormCustom() {
    const [selectedScent, setSelectedScent] = useState(scents[0]);
    const [selectedColor, setSelectedColor] = useState(waxColors[0]);
    const [selectedSize, setSelectedSize] = useState(sizes[0]);
    const [selectedPack, setSelectedPack] = useState(packs[0]);
    const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

    const toppingTotal = useMemo(
        () =>
            toppings
                .filter((item) => selectedToppings.includes(item.name))
                .reduce((sum, item) => sum + item.price, 0),
        [selectedToppings],
    );

    const totalPrice = selectedSize.price + toppingTotal;

    const toggleTopping = (name: string) => {
        setSelectedToppings((current) =>
            current.includes(name)
                ? current.filter((item) => item !== name)
                : [...current, name],
        );
    };

    const handleAddToCart = () => {
        toast.success("Đã thêm nến tùy chỉnh vào giỏ hàng");
    };

    return (
        <section
            id="customize"
            className="page-section fade-section bg-[#F8F0E4] px-4 py-16 text-[#2C1810] sm:px-6 lg:px-16"
        >
            <div className="mx-auto max-w-6xl">
                <div className="section-title text-center font-serif text-[2.4rem] font-light leading-tight text-[#6B1218] sm:text-[3rem]">
                    Tạo nến của bạn
                </div>
                <div className="section-sub mt-2 text-center text-sm uppercase tracking-[0.18em] text-[#2c1810]/45">
                    Chọn từng thành phần
                </div>

                <div className="configurator mt-10 grid gap-8 rounded-2xl bg-[#2C1810] p-5 text-[#F5F0E8] shadow-[0_18px_50px_rgba(44,24,16,0.22)] md:grid-cols-[52%_48%] md:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
                    <div className="config-panel">
                        <h3 className="mb-5 text-[0.72rem] uppercase tracking-[0.15em] text-[#F5F0E8]">
                            Thành phần
                        </h3>

                        <div className="option-group mb-8">
                            <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                                Hương thơm
                            </div>
                            <div className="options flex flex-wrap gap-2" id="scent-opts">
                                {scents.map((scent) => {
                                    const active = selectedScent.name === scent.name;

                                    return (
                                        <button
                                            key={scent.name}
                                            type="button"
                                            onClick={() => setSelectedScent(scent)}
                                            className={`opt scent-chip inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                                ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                                                : "border-[#F5F0E8]/25 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            <span
                                                className="scent-dot size-1.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: scent.color }}
                                            />
                                            {scent.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="option-group mb-8">
                            <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                                Màu sáp
                            </div>
                            <div className="color-opts flex flex-wrap gap-3" id="color-opts">
                                {waxColors.map((color) => {
                                    const active = selectedColor.name === color.name;

                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            title={color.name}
                                            className={`color-dot size-8 rounded-full border-2 transition hover:scale-110 ${active
                                                ? "scale-105 border-[#F5F0E8]"
                                                : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="option-group mb-8">
                            <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                                Kích thước
                            </div>
                            <div className="options flex flex-wrap gap-2" id="size-opts">
                                {sizes.map((size) => {
                                    const active = selectedSize.label === size.label;

                                    return (
                                        <button
                                            key={size.label}
                                            type="button"
                                            onClick={() => setSelectedSize(size)}
                                            className={`opt rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                                ? "border-[#F5F0E8] bg-[#F5F0E8] font-semibold text-[#6B1218] shadow-[0_8px_18px_rgba(107,18,24,0.12)]"
                                                : "border-[#F5F0E8]/30 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            {size.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="option-group mb-8">
                            <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                                Bao bì
                            </div>
                            <div className="options flex flex-wrap gap-2" id="pack-opts">
                                {packs.map((pack) => {
                                    const active = selectedPack === pack;

                                    return (
                                        <button
                                            key={pack}
                                            type="button"
                                            onClick={() => setSelectedPack(pack)}
                                            className={`opt rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                                ? "border-[#F5F0E8] bg-[#F5F0E8] font-semibold text-[#6B1218]"
                                                : "border-[#F5F0E8]/30 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            {pack}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="option-group">
                            <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                                Topping
                            </div>
                            <div className="options flex flex-wrap gap-2" id="topping-opts">
                                {toppings.map((topping) => {
                                    const active = selectedToppings.includes(topping.name);

                                    return (
                                        <button
                                            key={topping.name}
                                            type="button"
                                            onClick={() => toggleTopping(topping.name)}
                                            className={`opt topping-chip inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                                ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                                                : "border-[#F5F0E8]/25 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                                }`}
                                        >
                                            <span className="topping-check w-3 text-center text-[0.65rem]">
                                                {active ? "☑" : "☐"}
                                            </span>
                                            {topping.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="preview-box flex min-h-[480px] flex-col items-start rounded-2xl bg-[#F5F0E8] p-6 text-left text-[#2C1810] md:p-7 lg:p-8">
                            <div
                                className="mini-candle relative mx-auto mb-4 h-[120px] w-[70px] rounded-[5px_5px_2px_2px] shadow-[inset_-8px_0_16px_rgba(0,0,0,0.1),inset_3px_0_8px_rgba(255,255,255,0.35)] transition"
                                style={{
                                    background: `linear-gradient(105deg, ${selectedColor.value}, #f5ede3 42%, #c8b89a)`,
                                }}
                            >
                                <div className="mini-wick absolute -top-3 left-1/2 h-2.5 w-0.5 -translate-x-1/2 bg-[#2C1810]" />
                                <div className="mini-flame absolute -top-[26px] left-1/2 h-4 w-2 -translate-x-1/2 animate-[candle-flicker_1.2s_ease-in-out_infinite] rounded-[50%_50%_30%_30%] bg-[radial-gradient(ellipse_at_50%_80%,#fff_0%,#FFE566_35%,#FF9A00_70%,transparent_100%)]" />
                            </div>

                            <div
                                className="preview-name mt-4 font-serif text-[1.6rem] font-semibold text-[#6B1218]"
                                id="prev-name"
                            >
                                {selectedScent.name}
                            </div>
                            <div
                                className="preview-desc mb-4 text-[0.85rem] font-light italic text-[#8a6f5e]"
                                id="prev-desc"
                            >
                                {selectedScent.desc}
                            </div>

                            <div className="preview-divider my-3 h-px w-full bg-[#6B1218]/15" />

                            <div className="preview-details w-full text-[0.82rem] leading-7 text-[#2C1810]">
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium">Kích thước:</span>
                                    <span id="prev-size">{selectedSize.label}</span>
                                </div>
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium">Màu sáp:</span>
                                    <span id="prev-color">{selectedColor.name}</span>
                                </div>
                                <div className="preview-detail-row flex justify-between gap-3">
                                    <span className="detail-label font-medium">Bao bì:</span>
                                    <span id="prev-pack">{selectedPack}</span>
                                </div>
                            </div>

                            <div className="preview-divider my-3 h-px w-full bg-[#6B1218]/15" />

                            <div className="preview-toppings my-2 w-full" id="preview-toppings">
                                <div className="topping-list flex flex-wrap gap-2" id="topping-list">
                                    {selectedToppings.length === 0 ? (
                                        <div className="no-topping text-[0.8rem] italic text-[#a89080]">
                                            Chưa chọn topping
                                        </div>
                                    ) : (
                                        selectedToppings.map((topping) => (
                                            <span
                                                key={topping}
                                                className="topping-tag rounded-full bg-[#6B1218]/15 px-3 py-1 text-[0.75rem] font-medium text-[#6B1218]"
                                            >
                                                {topping}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="preview-divider my-3 h-px w-full bg-[#6B1218]/15" />

                            <div
                                className="preview-price-breakdown w-full pt-2 text-[0.82rem] text-[#2C1810]"
                                id="price-breakdown"
                            >
                                <div className="price-line flex justify-between gap-3 leading-6">
                                    <span>Nến {selectedSize.label.split(" ")[0]}:</span>
                                    <span>{formatPrice(selectedSize.price)}</span>
                                </div>
                                {selectedToppings.length > 0 ? (
                                    <div className="price-line flex justify-between gap-3 leading-6">
                                        <span>Topping:</span>
                                        <span>{formatPrice(toppingTotal)}</span>
                                    </div>
                                ) : null}
                                <div className="price-total mt-3 flex justify-between gap-3 border-t border-[#6B1218]/20 pt-3 font-serif text-[1.35rem] font-semibold text-[#6B1218]">
                                    <span>Tổng:</span>
                                    <span id="price-display">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="price-row mt-8 flex flex-col gap-4 border-t border-[#F5F0E8]/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="add-btn w-full rounded-full bg-[#6B1218] px-8 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] shadow-[0_8px_24px_rgba(107,18,24,0.3)] transition hover:bg-[#4A0C10] hover:shadow-[0_12px_32px_rgba(107,18,24,0.5)]"
                            >
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
