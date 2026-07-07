"use client";


import { useMemo, useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CardProduct from "@/src/components/client/product/cardProduct";
import ProductReviews from "@/src/components/client/product/ProductReviews";

const DetailCardProductModal = dynamic(() => import("@/src/components/client/product/detailCardProductModal"), { ssr: false });

const getCloudinaryThumbnailUrl = (url: string) => {
  if (url && url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/w_80,c_scale,q_auto,f_auto/");
  }
  return url;
};
import { useToast } from "@/src/components/ui/toastProvider";
import { addToCartAction } from "../../../lib/action/cart.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useCartStore } from "@/src/store/useCartStore";
import type {
  DetailCardProductProps,
  DetailOptionGroupProps,
} from "../../../lib/types/client";
import styles from "../../../styles/detailCardProduct.module.css";
import { callAction } from "@/src/lib/utils/callAction";


const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";


const getProductImages = (images: unknown) => {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image): image is string => typeof image === "string" && image.length > 0)
    .slice(0, 7);
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
  isModal = true,
  similarProducts = [],
  initialReviews,
}: DetailCardProductProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { incrementCartCount, decrementCartCount } = useCartStore();
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
      router.push("/#collection");
    }
  };


  const handleAddToCart = () => {
    if (optimisticAdding) return;
    setCartError("");

    const addQty = Number(quantity) || 1;

    // 1. Optimistic Update
    incrementCartCount(addQty);
    toast.success("Đã thêm sản phẩm vào giỏ hàng");

    startTransition(async () => {
      setOptimisticAdding(true);
      try {
        // action-(thêm sản phẩm vào giỏ hàng)
        const result = await callAction(() => addToCartAction({
          color_id: selectedColor?.id,
          pack_id: selectedPackaging?.id,
          product_id: product.id,
          quantity: addQty,
          scent_id: product.options?.scents?.[0]?.id,
          size_id: selectedSize?.id,
        }), "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          // Rollback
          decrementCartCount(addQty);
          setCartError(getFriendlyResponseError(result.error));
          toast.error(getFriendlyResponseError(result.error));
          return;
        }

      } catch {
        // Rollback
        decrementCartCount(addQty);
      } finally {
        setOptimisticAdding(false);
      }
    });
  };

  const tabsBlock = (className?: string) => (
    <div className={`mt-6 border-t p-4 sm:p-5 ${
      isModal 
        ? "rounded-2xl bg-[#F2E8D9] border-[#6B4C35]/15 shadow-[0_10px_24px_rgba(44,24,16,0.06)]" 
        : "bg-transparent border-[#F5F0E8]/20 shadow-none"
    } ${className || ""}`}>
      <div className={`mb-4 flex flex-wrap gap-4 border-b pb-3 ${isModal ? "border-[#6B4C35]/15" : "border-[#F5F0E8]/20"}`}>
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
            className={`relative py-1 text-sm transition active:scale-95 ${activeTab === tab.id
                ? (isModal ? "font-medium text-[#6B1218] after:absolute after:-bottom-[13px] after:left-0 after:h-0.5 after:w-full after:bg-[#6B1218] after:content-['']" : "font-medium text-[#F5F0E8] after:absolute after:-bottom-[13px] after:left-0 after:h-0.5 after:w-full after:bg-[#F5F0E8] after:content-['']")
                : (isModal ? "text-[#6B4C35] hover:text-[#6B1218]" : "text-[#F5F0E8]/60 hover:text-[#F5F0E8]")
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`h-24 overflow-y-auto text-sm font-light leading-6 pr-1 ${isModal ? "text-[#2C1810]" : "text-[#F5F0E8]/90"}`}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes tabFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-tab-fade-in {
            animation: tabFadeIn 0.3s ease-out forwards;
          }
        `}} />
        <div key={activeTab} className="animate-tab-fade-in">
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
    </div>
  );

  const innerContent = (
    <div className={`${
      isModal 
        ? "text-[#2C1810] rounded-2xl bg-[#F8F0E4] p-4 shadow-[0_26px_80px_rgba(30,6,8,0.42)] sm:p-5 lg:p-6" 
        : "text-[#F5F0E8] p-6 sm:p-8 lg:p-10 rounded-[2rem] bg-black/20 backdrop-blur-xl border border-[#F5F0E8]/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
    }`}>
      <button
        type="button"
        onClick={handleClose}
        className={`group mb-4 text-sm transition ${isModal ? "text-[#6B4C35] hover:text-[#6B1218]" : "text-[#F5F0E8]/70 hover:text-[#F5F0E8]"}`}
      >
        <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span> Quay lại
      </button>

      <div className={`grid gap-6 ${
        isModal 
          ? "lg:grid-cols-2 lg:gap-10 rounded-2xl bg-[#F8F0E4]" 
          : "lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
      }`}>
        <div className="product-visual">
          <div className="relative group flex aspect-[4/5] lg:aspect-square lg:h-[340px] items-center justify-center rounded-2xl p-4 border border-[#2C1810]/5 shadow-[0_20px_50px_rgba(44,24,16,0.06)] overflow-hidden mx-auto w-full">
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
            
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/70 text-[#2C1810] opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 backdrop-blur-md hover:scale-110"
                  aria-label="Ảnh trước"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/70 text-[#2C1810] opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 backdrop-blur-md hover:scale-110"
                  aria-label="Ảnh sau"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>

          {productImages.length > 1 ? (
            <div
              className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2"
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
                        ? (isModal ? "border-[#6B1218] shadow-[0_8px_20px_rgba(107,18,24,0.2)]" : "border-[#F5F0E8] shadow-[0_8px_20px_rgba(245,240,232,0.3)]")
                        : (isModal ? "border-[#2C1810]/10 hover:border-[#6B1218]/55" : "border-transparent hover:border-[#F5F0E8]/50")
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
              className={`font-serif text-[2rem] font-bold leading-tight sm:text-[2.5rem] ${isModal ? "text-[#2C1810]" : "text-[#F5F0E8]"}`}
            >
              {product.name}
            </h1>
            <p className={`mt-1 text-[0.8rem] uppercase tracking-[0.16em] ${isModal ? "text-[#6B4C35]" : "text-[#F5F0E8]/70"}`}>
              {product.category?.name ?? "ChamCham"}
            </p>
            <p className={`mt-4 font-sans text-[1.2rem] font-bold sm:text-[1.75rem] ${isModal ? "text-[#6B1218]" : "text-[#F5F0E8]"}`}>
              {formatPrice(totalPrice)}
            </p>
            <p
              id="product-detail-description"
              className={`mt-3 text-sm font-light italic leading-6 ${isModal ? "text-[#6B4C35]" : "text-[#F5F0E8]/80"}`}
            >
              {scentNote}
            </p>

            <div className={`flex flex-wrap gap-x-12 gap-y-6 border-t mt-8 pt-6 ${isModal ? "border-[#6B4C35]/15" : "border-[#F5F0E8]/20"}`}>
              <DetailOptionGroup
                label="Kích thước"
                options={product.options?.sizes ?? []}
                selectedId={selectedSize?.id}
                renderLabel={(item) =>
                  item.weight_gram ? `${item.name} (${item.weight_gram}g)` : item.name
                }
                onSelect={setSelectedSize}
                noBorder
                isModal={isModal}
              />

              <DetailOptionGroup
                label="Màu sáp"
                options={product.options?.waxColors ?? []}
                selectedId={selectedColor?.id}
                onSelect={setSelectedColor}
                noBorder
                isModal={isModal}
              />

              <DetailOptionGroup
                label="Bao bì"
                options={product.options?.packagings ?? []}
                selectedId={selectedPackaging?.id}
                onSelect={setSelectedPackaging}
                noBorder
                isModal={isModal}
              />
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className={`border-t pt-6 flex flex-col xl:flex-row xl:items-center gap-5 ${isModal ? "border-[#6B4C35]/15" : "border-[#F5F0E8]/20"}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[0.8rem] uppercase tracking-[0.16em] whitespace-nowrap ${isModal ? "text-[#6B4C35]" : "text-[#F5F0E8]/70"}`}>
                  Số lượng:
                </span>
                <div className={`flex items-center gap-2 rounded-lg px-2 py-1 border ${isModal ? "bg-[#F2E8D9]/50 border-[#6B4C35]/20" : "bg-[#F5F0E8]/10 border-[#F5F0E8]/30"}`}>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, (Number(value) || 1) - 1))}
                    className={`w-7 h-7 rounded text-md transition flex items-center justify-center ${isModal ? "hover:bg-[#6B1218] hover:text-[#F5F0E8]" : "hover:bg-[#F5F0E8] hover:text-[#2C1810]"}`}
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
                    className={`w-7 h-7 rounded text-md transition flex items-center justify-center ${isModal ? "hover:bg-[#6B1218] hover:text-[#F5F0E8]" : "hover:bg-[#F5F0E8] hover:text-[#2C1810]"}`}
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
                  className={`flex-1 rounded-full px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-65 whitespace-nowrap ${isModal ? "bg-[#6B1218] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.3)] hover:bg-[#4A0C10]" : "bg-[#F5F0E8] text-[#2C1810] hover:bg-white"}`}
                >
                  {optimisticAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex-1 rounded-full border px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] transition active:scale-95 whitespace-nowrap ${isModal ? "border-[#6B1218] text-[#6B1218] hover:bg-[#6B1218] hover:text-[#F5F0E8]" : "border-[#F5F0E8] text-[#F5F0E8] hover:bg-[#F5F0E8] hover:text-[#2C1810]"}`}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>

            {cartError && (
              <p className={`text-sm font-medium ${isModal ? "text-[#6B1218]" : "text-[#FF9800]"}`}>
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
      <main 
        className="-mt-20 pt-20 min-h-dvh text-[#2C1810] relative"
        style={{
          backgroundImage: "url('/option_background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <section className={`relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 ${isModal ? "max-w-7xl" : "max-w-[1400px]"}`}>
          {innerContent}

          {/* Reviews Section */}
          <ProductReviews 
            productId={product.id} 
            initialReviews={initialReviews} 
            isAuthenticated={isAuthenticated} 
          />

          {similarProducts && similarProducts.length > 0 && (
            <div className="mt-12 sm:mt-16 p-8 sm:p-10 lg:p-12 rounded-[2rem] bg-black/20 backdrop-blur-xl border border-[#F5F0E8]/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#F5F0E8]/20 to-transparent"></div>
              
              <div className="text-center mb-10 sm:mb-12">
                <h3 className="font-serif text-2xl font-light text-[#F5F0E8] sm:text-3xl tracking-wide">
                  Có thể bạn sẽ thích
                </h3>
                <div className="mx-auto mt-4 h-[1px] w-12 bg-[#D6A15F]/50"></div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {similarProducts.map((p) => (
                  <CardProduct
                    key={p.id}
                    href={`/collection/${p.id}`}
                    id={p.id}
                    imageUrl={(Array.isArray(p.images) ? p.images[0] : (p.images as any)?.[0]) || "/placeholder.jpg"}
                    name={p.name}
                    price={p.base_price_cents || 0}
                    scentNote={p.description || ""}
                  />
                ))}
              </div>
            </div>
          )}
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
  isModal = true,
}: DetailOptionGroupProps & { isModal?: boolean }) {
  if (options.length === 0) return null;

  return (
    <div className={noBorder ? "" : `border-t pt-5 ${isModal ? "border-[#6B4C35]/15" : "border-[#F5F0E8]/20"}`}>
      <div className={`mb-3 text-[0.8rem] uppercase tracking-[0.16em] ${isModal ? "text-[#6B4C35]" : "text-[#F5F0E8]/70"}`}>
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
              className={`rounded-lg border px-4 py-3 text-sm transition active:scale-95 ${active
                  ? (isModal ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]" : "border-[#F5F0E8] bg-[#F5F0E8] text-[#2C1810]")
                  : (isModal ? "border-[#6B4C35]/30 bg-[#F8F0E4] text-[#2C1810] hover:border-[#6B1218] hover:text-[#6B1218]" : "border-[#F5F0E8]/30 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8] hover:bg-[#F5F0E8]/10")
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
