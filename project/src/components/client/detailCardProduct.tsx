"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type {
  DetailCardProductProps,
  DetailOptionGroupProps,
} from "../../lib/types/client";
import styles from "../../styles/detailCardProduct.module.css";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const getFirstImage = (images: unknown) => {
  if (Array.isArray(images) && typeof images[0] === "string") {
    return images[0];
  }

  return "";
};

const getProductCandleWaxClass = (color: string) => {
  const normalizedColor = color.toLowerCase();

  if (normalizedColor === "#c8ddc4") return styles.sage;
  if (normalizedColor === "#e7b4d4") return styles.blossom;
  if (normalizedColor === "#e4a9cb") return styles.peony;
  if (normalizedColor === "#d29a61") return styles.cedar;
  if (normalizedColor === "#c88f58") return styles.sandalwood;
  if (normalizedColor === "#f5ecd8") return styles.customCream;
  if (normalizedColor === "#e8c878") return styles.customHoney;
  if (normalizedColor === "#e8b4a0") return styles.customBlush;
  if (normalizedColor === "#c87878") return styles.customRose;
  if (normalizedColor === "#a07850") return styles.customEarth;
  if (normalizedColor === "#3c2820") return styles.customSmoke;

  return styles.cream;
};

export default function DetailCardProduct({
  isAuthenticated = false,
  product,
  onClose,
}: DetailCardProductProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "usage">(
    "description",
  );
  const [selectedSize, setSelectedSize] = useState(
    product.options?.sizes?.[0] ?? null,
  );
  const [selectedColor, setSelectedColor] = useState(
    product.options?.waxColors?.[0] ?? null,
  );
  const [selectedPackaging, setSelectedPackaging] = useState(
    product.options?.packagings?.[0] ?? null,
  );

  const image = getFirstImage(product.images);
  const candleColor = selectedColor?.hex_code ?? "#F1DEC5";
  const extraPrice =
    (selectedSize?.price_extra_cents ?? 0) +
    (selectedColor?.price_extra_cents ?? 0) +
    (selectedPackaging?.price_extra_cents ?? 0);
  const totalPrice = (product.base_price_cents + extraPrice) * quantity;

  const scentNote = useMemo(() => {
    if (product.description) return product.description;

    const firstScents = product.options?.scents?.slice(0, 3).map((item) => item.name);
    return firstScents?.length
      ? firstScents.join(", ")
      : "Nến thơm thủ công từ sáp đậu nành tự nhiên.";
  }, [product.description, product.options?.scents]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      setTimeout(() => onClose(), 200); // Đợi hiệu ứng tắt modal chạy xong
    } else {
      router.push("/collection");
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      router.push("/login");
      return;
    }

    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="product-detail-title"
      aria-describedby="product-detail-description"
      className="px-4"
    >
      <Box
        component="section"
        className={styles.modalShell}
      >
        <div className="rounded-2xl bg-[#F8F0E4] p-4 text-[#2C1810] shadow-[0_26px_80px_rgba(30,6,8,0.42)] sm:p-6 lg:p-8">
          <button
            type="button"
            onClick={handleClose}
            className="mb-5 text-sm text-[#6B4C35] transition hover:text-[#6B1218]"
          >
            ← Quay lại
          </button>

          <div className="grid gap-8 rounded-2xl bg-[#F8F0E4] lg:grid-cols-2 lg:gap-12">
            <div className="product-visual">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-[#F5F0E8] p-8 shadow-[0_8px_22px_rgba(44,24,16,0.08)]">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="relative h-[220px] w-[165px] rounded-[8px_8px_6px_6px] shadow-[0_28px_54px_rgba(44,24,16,0.14),inset_-16px_0_28px_rgba(126,93,56,0.1),inset_12px_0_22px_rgba(255,255,255,0.28)] sm:h-[250px] sm:w-[185px]">
                    <div
                      className={`${styles.productCandleWax} ${getProductCandleWaxClass(candleColor)}`}
                    />
                    <div className="absolute -top-5 left-1/2 h-7 w-8 -translate-x-1/2 rounded-[6px_6px_0_0] bg-[#D6A15F]" />
                    <div className="absolute -top-4 left-1/2 h-5 w-2.5 -translate-x-1/2 rounded-full bg-[#FF9800] shadow-[0_0_20px_rgba(255,152,0,0.72)]" />
                  </div>
                )}
              </div>
            </div>

            <div className="product-info">
              <h1
                id="product-detail-title"
                className="font-serif text-[2.2rem] font-bold leading-tight text-[#2C1810] sm:text-[2.6rem]"
              >
                {product.name}
              </h1>
              <p className="mt-2 text-[0.78rem] uppercase tracking-[0.16em] text-[#6B4C35]">
                {product.category?.name ?? "ChamCham"}
              </p>
              <p className="mt-6 font-serif text-[2rem] font-bold text-[#6B1218] sm:text-[2.35rem]">
                {formatPrice(totalPrice)}
              </p>
              <p
                id="product-detail-description"
                className="mt-4 text-sm font-light italic leading-7 text-[#6B4C35]"
              >
                {scentNote}
              </p>

              <div className="mt-8 space-y-6">
                <DetailOptionGroup
                  label="Kích thước"
                  options={product.options?.sizes ?? []}
                  selectedId={selectedSize?.id}
                  renderLabel={(item) =>
                    item.weight_gram ? `${item.name} — ${item.weight_gram}g` : item.name
                  }
                  onSelect={setSelectedSize}
                />

                <DetailOptionGroup
                  label="Màu sáp"
                  options={product.options?.waxColors ?? []}
                  selectedId={selectedColor?.id}
                  onSelect={setSelectedColor}
                />

                <DetailOptionGroup
                  label="Bao bì"
                  options={product.options?.packagings ?? []}
                  selectedId={selectedPackaging?.id}
                  onSelect={setSelectedPackaging}
                />

                <div className="border-t border-[#6B4C35]/15 pt-5">
                  <div className="mb-3 text-[0.75rem] uppercase tracking-[0.16em] text-[#6B4C35]">
                    Số lượng
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="size-10 rounded-lg border border-[#6B4C35]/30 text-xl transition hover:border-[#6B1218] hover:text-[#6B1218]"
                    >
                      −
                    </button>
                    <div className="min-w-12 text-center font-serif text-2xl font-bold">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => value + 1)}
                      className="size-10 rounded-lg border border-[#6B4C35]/30 text-xl transition hover:border-[#6B1218] hover:text-[#6B1218]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full rounded-full bg-[#6B1218] px-6 py-4 text-[0.85rem] font-medium uppercase tracking-[0.08em] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.3)] transition hover:bg-[#4A0C10]"
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-full border border-[#6B1218] px-6 py-4 text-[0.85rem] font-medium uppercase tracking-[0.08em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8]"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border-t border-[#6B4C35]/15 bg-[#F2E8D9] p-5 shadow-[0_10px_24px_rgba(44,24,16,0.06)] sm:p-6">
            <div className="mb-5 flex flex-wrap gap-5 border-b border-[#6B4C35]/15 pb-4">
              {[
                { id: "description", label: "Mô tả" },
                { id: "ingredients", label: "Thành phần" },
                { id: "usage", label: "Cách sử dụng" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id as "description" | "ingredients" | "usage")
                  }
                  className={`relative py-1 text-sm transition ${
                    activeTab === tab.id
                      ? "font-medium text-[#6B1218] after:absolute after:-bottom-[17px] after:left-0 after:h-0.5 after:w-full after:bg-[#6B1218] after:content-['']"
                      : "text-[#6B4C35] hover:text-[#6B1218]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-sm font-light leading-8 text-[#2C1810]">
              {activeTab === "description" ? (
                <>
                  <p>
                    Nến thơm ChamCham được làm từ sáp đậu nành tự nhiên, tạo
                    hương thơm mềm mại và tinh tế cho không gian sống.
                  </p>
                  <p className="mt-3">
                    Mỗi sản phẩm được hoàn thiện thủ công với sự tỉ mỉ trong
                    từng chi tiết.
                  </p>
                </>
              ) : null}

              {activeTab === "ingredients" ? (
                <p>
                  <strong>Thành phần chính:</strong> Sáp đậu nành, tinh dầu
                  thiên nhiên, bấc cotton và hương thơm thực vật.
                </p>
              ) : null}

              {activeTab === "usage" ? (
                <ul className="list-disc space-y-2 pl-5">
                  <li>Đốt nến trong không gian thoáng và tránh gió mạnh.</li>
                  <li>Thời gian đốt lý tưởng mỗi lần là 3-4 giờ.</li>
                  <li>Cắt bấc còn khoảng 5mm trước mỗi lần sử dụng.</li>
                  <li>Không để nến cháy khi bạn rời khỏi phòng.</li>
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

function DetailOptionGroup({
  label,
  onSelect,
  options,
  renderLabel,
  selectedId,
}: DetailOptionGroupProps) {
  if (options.length === 0) return null;

  return (
    <div className="border-t border-[#6B4C35]/15 pt-5">
      <div className="mb-3 text-[0.75rem] uppercase tracking-[0.16em] text-[#6B4C35]">
        {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const active = selectedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className={`rounded-lg border px-4 py-3 text-sm transition ${
                active
                  ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                  : "border-[#6B4C35]/30 bg-[#F8F0E4] text-[#2C1810] hover:border-[#6B1218] hover:text-[#6B1218]"
              }`}
            >
              {renderLabel ? renderLabel(option) : option.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
