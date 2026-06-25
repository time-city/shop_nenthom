"use client";


import { useMemo, useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const DetailCardProductModal = dynamic(() => import("./detailCardProductModal"), { ssr: false });

const getCloudinaryThumbnailUrl = (url: string) => {
  if (url && url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/w_80,c_scale,q_auto,f_auto/");
  }
  return url;
};
import { useToast } from "@/src/components/ui/toast-provider";
import { addToCartAction } from "../../lib/action/cart.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useCartStore } from "@/src/store/useCartStore";
import type {
  DetailCardProductProps,
  DetailOptionGroupProps,
} from "../../lib/types/client";
import styles from "../../styles/detailCardProduct.module.css";
import { callAction } from "@/src/lib/utils/callAction";


const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";


const getProductImages = (images: unknown) => {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image): image is string => typeof image === "string" && image.length > 0)
    .slice(0, 4);
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
  product,
  onClose,
  isModal = true,
}: DetailCardProductProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { incrementCartCount } = useCartStore();
  const [open, setOpen] = useState(true);
 const [selectedImageIndex, setSelectedImageIndex] = useState(0);
 const [cartError, setCartError] = useState("");
  const [quantity, setQuantity] = useState<number | "">(1);
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
  const [isAddingToCart] = useState(false);
  const [, startTransition] = useTransition();
  const [optimisticAdding, setOptimisticAdding] = useOptimistic(
    isAddingToCart,
    (state, update: boolean) => update
  );


  const productImages = getProductImages(product.images);
  const image = productImages[selectedImageIndex] ?? productImages[0] ?? "";
  const candleColor = selectedColor?.hex_code ?? "#F1DEC5";
  const extraPrice =
    (selectedSize?.price_extra_cents ?? 0) +
    (selectedColor?.price_extra_cents ?? 0) +
    (selectedPackaging?.price_extra_cents ?? 0);
  const totalPrice = (product.base_price_cents + extraPrice) * (Number(quantity) || 0);


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
    if (optimisticAdding) return;
    setCartError("");

    startTransition(async () => {
      setOptimisticAdding(true);
      try {
        // action-(thêm sản phẩm vào giỏ hàng)
        const result = await callAction(() => addToCartAction({
          color_id: selectedColor?.id,
          pack_id: selectedPackaging?.id,
          product_id: product.id,
          quantity: Number(quantity) || 1,
          scent_id: product.options?.scents?.[0]?.id,
          size_id: selectedSize?.id,
        }), "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          setCartError(getFriendlyResponseError(result.error));
          return;
        }

        toast.success("Đã thêm sản phẩm vào giỏ hàng");
        // Cập nhật badge số lượng trên header
        incrementCartCount(Number(quantity) || 1);
      } catch {
        // Rollback is automatic
      }
    });
  };

  const tabsBlock = (className?: string) => (
    <div className={`mt-6 border-t border-[#6B4C35]/15 p-4 sm:p-5 ${
      isModal 
        ? "rounded-2xl bg-[#F2E8D9] shadow-[0_10px_24px_rgba(44,24,16,0.06)]" 
        : "bg-transparent shadow-none"
    } ${className || ""}`}>
      <div className="mb-4 flex flex-wrap gap-4 border-b border-[#6B4C35]/15 pb-3">
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
            className={`relative py-1 text-xs transition ${activeTab === tab.id
                ? "font-medium text-[#6B1218] after:absolute after:-bottom-[13px] after:left-0 after:h-0.5 after:w-full after:bg-[#6B1218] after:content-['']"
                : "text-[#6B4C35] hover:text-[#6B1218]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-20 overflow-y-auto text-xs font-light leading-6 text-[#2C1810] pr-1">
        {activeTab === "description" ? (
          <>
            {scentNote ? (
              <p style={{ whiteSpace: "pre-wrap" }}>{scentNote}</p>
            ) : (
              <>
                <p>
                  Nến thơm ChamCham được làm từ sáp đậu nành tự nhiên, tạo
                  hương thơm mềm mại và tinh tế cho không gian sống.
                </p>
                <p className="mt-2">
                  Mỗi sản phẩm được hoàn thiện thủ công với sự tỉ mỉ trong
                  từng chi tiết.
                </p>
              </>
            )}
          </>
        ) : null}

        {activeTab === "ingredients" ? (
          (product as { ingredients?: string | null }).ingredients ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{(product as { ingredients?: string | null }).ingredients}</p>
          ) : (
            <p>
              <strong>Thành phần chính:</strong> Sáp đậu nành, tinh dầu
              thiên nhiên, bấc cotton và hương thơm thực vật.
            </p>
          )
        ) : null}

        {activeTab === "usage" ? (
          (product as { usage_instructions?: string | null }).usage_instructions ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{(product as { usage_instructions?: string | null }).usage_instructions}</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              <li>Đốt nến trong không gian thoáng và tránh gió mạnh.</li>
              <li>Thời gian đốt lý tưởng mỗi lần là 3-4 giờ.</li>
              <li>Cắt bấc còn khoảng 5mm trước mỗi lần sử dụng.</li>
              <li>Không để nến cháy khi bạn rời khỏi phòng.</li>
            </ul>
          )
        ) : null}
      </div>
    </div>
  );

  const innerContent = (
    <div className={`text-[#2C1810] ${
      isModal 
        ? "rounded-2xl bg-[#F8F0E4] p-4 shadow-[0_26px_80px_rgba(30,6,8,0.42)] sm:p-5 lg:p-6" 
        : "p-0 bg-transparent shadow-none"
    }`}>
      <button
        type="button"
        onClick={handleClose}
        className="mb-4 text-sm text-[#6B4C35] transition hover:text-[#6B1218]"
      >
        ← Quay lại
      </button>

      <div className={`grid gap-6 ${
        isModal 
          ? "lg:grid-cols-2 lg:gap-10 rounded-2xl bg-[#F8F0E4]" 
          : "lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
      }`}>
        <div className="product-visual">
          <div className="flex aspect-[4/5] lg:aspect-square lg:h-[340px] items-center justify-center rounded-2xl  p-4 border border-[#2C1810]/5 shadow-[0_20px_50px_rgba(44,24,16,0.06)] overflow-hidden mx-auto w-full">
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image}
                alt={product.name}
                className="max-h-full max-w-full rounded-xl object-contain transition duration-700 ease-out hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FAF6F0]">
                <div className="relative h-[200px] w-[150px] rounded-[8px_8px_6px_6px] shadow-[0_28px_54px_rgba(44,24,16,0.14),inset_-16px_0_28px_rgba(126,93,56,0.1),inset_12px_0_22px_rgba(255,255,255,0.28)]">
                  <div
                    className={`${styles.productCandleWax} ${getProductCandleWaxClass(candleColor)}`}
                  />
                  <div className="absolute -top-5 left-1/2 h-7 w-8 -translate-x-1/2 rounded-[6px_6px_0_0] bg-[#D6A15F]" />
                  <div className="absolute -top-4 left-1/2 h-5 w-2.5 -translate-x-1/2 rounded-full bg-[#FF9800] shadow-[0_0_20px_rgba(255,152,0,0.72)]" />
                </div>
              </div>
            )}
          </div>

          {productImages.length > 1 ? (
            <div
              className="mt-3 grid grid-cols-4 gap-2"
              aria-label="Danh sách ảnh sản phẩm"
            >
              {productImages.map((thumbnail, index) => {
                const isSelected = index === selectedImageIndex;

                return (
                  <button
                    key={`${thumbnail}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={
                      index === 0
                        ? "Xem ảnh đại diện"
                        : `Xem ảnh phụ ${index}`
                    }
                    aria-pressed={isSelected}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white p-1 transition ${isSelected
                        ? "border-[#6B1218] shadow-[0_8px_20px_rgba(107,18,24,0.2)]"
                        : "border-[#2C1810]/10 hover:border-[#6B1218]/55"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getCloudinaryThumbnailUrl(thumbnail)}
                      alt={
                        index === 0
                          ? `${product.name} - ảnh đại diện`
                          : `${product.name} - ảnh phụ ${index}`
                      }
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}

          {tabsBlock("hidden lg:block")}
        </div>

        <div className="product-info flex flex-col justify-between">
          <div>
            <h1
              id="product-detail-title"
              className="font-serif text-[1.8rem] font-bold leading-tight text-[#2C1810] sm:text-[2.2rem]"
            >
              {product.name}
            </h1>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-[#6B4C35]">
              {product.category?.name ?? "ChamCham"}
            </p>
            <p className="mt-4 font-sans text-[1rem] font-bold text-[#6B1218] sm:text-[1.5rem]">
              {formatPrice(totalPrice)}
            </p>
            <p
              id="product-detail-description"
              className="mt-3 text-xs font-light italic leading-6 text-[#6B4C35]"
            >
              {scentNote}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#6B4C35]/15 mt-8 pt-6">
              <DetailOptionGroup
                label="Kích thước"
                options={product.options?.sizes ?? []}
                selectedId={selectedSize?.id}
                renderLabel={(item) =>
                  item.weight_gram ? `${item.name} (${item.weight_gram}g)` : item.name
                }
                onSelect={setSelectedSize}
                noBorder
              />

              <DetailOptionGroup
                label="Màu sáp"
                options={product.options?.waxColors ?? []}
                selectedId={selectedColor?.id}
                onSelect={setSelectedColor}
                noBorder
              />

              <DetailOptionGroup
                label="Bao bì"
                options={product.options?.packagings ?? []}
                selectedId={selectedPackaging?.id}
                onSelect={setSelectedPackaging}
                noBorder
              />
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="border-t border-[#6B4C35]/15 pt-6 flex flex-col xl:flex-row xl:items-center gap-5">
              <div className="flex items-center gap-3">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-[#6B4C35] whitespace-nowrap">
                  Số lượng:
                </span>
                <div className="flex items-center gap-2 bg-[#F2E8D9]/50 rounded-lg px-2 py-1 border border-[#6B4C35]/20">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, (Number(value) || 1) - 1))}
                    className="w-7 h-7 rounded text-md transition hover:bg-[#6B1218] hover:text-[#F5F0E8] flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setQuantity("");
                        return;
                      }
                      const intVal = parseInt(val, 10);
                      if (!isNaN(intVal)) {
                        setQuantity(Math.max(1, intVal));
                      }
                    }}
                    onBlur={() => {
                      if (quantity === "" || isNaN(Number(quantity)) || Number(quantity) < 1) {
                        setQuantity(1);
                      }
                    }}
                    className="w-8 text-center font-serif text-lg font-bold bg-transparent border-none outline-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => (Number(value) || 1) + 1)}
                    className="w-7 h-7 rounded text-md transition hover:bg-[#6B1218] hover:text-[#F5F0E8] flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={optimisticAdding}
                  className="flex-1 rounded-full bg-[#6B1218] px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.3)] transition hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-65 whitespace-nowrap"
                >
                  {optimisticAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-full border border-[#6B1218] px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] whitespace-nowrap"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>

            {cartError && (
              <p className="text-sm font-medium text-[#6B1218]">
                {cartError}
              </p>
            )}
          </div>
        </div>
      </div>

      {tabsBlock("block lg:hidden")}
    </div>
  );

  if (!isModal) {
    return (
      <main className="min-h-[calc(100dvh-5rem)] bg-[#F2E8D9] text-[#2C1810]">
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          {innerContent}
        </section>
      </main>
    );
  }

  return (
    <DetailCardProductModal open={open} onClose={handleClose}>
      {innerContent}
    </DetailCardProductModal>
  );
}


function DetailOptionGroup({
  label,
  onSelect,
  options,
  renderLabel,
  selectedId,
  noBorder,
}: DetailOptionGroupProps) {
  if (options.length === 0) return null;


  return (
    <div className={noBorder ? "" : "border-t border-[#6B4C35]/15 pt-5"}>
      <div className="mb-2 text-[0.7rem] uppercase tracking-[0.16em] text-[#6B4C35]">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selectedId === option.id;


          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              className={`rounded-lg border px-3 py-2.5 text-xs transition ${active
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
