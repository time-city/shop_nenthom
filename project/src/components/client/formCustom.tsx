"use client";




import { useEffect, useMemo, useState } from "react";
import type { ClientProductOptionItemInterface } from "../../interface/clientInterface";
import { useToast } from "@/src/components/ui/toast-provider";
import { addToCartAction } from "../../lib/action/cart.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useCartStore } from "@/src/store/useCartStore";
import type { FormCustomProps } from "../../lib/types/client";


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
   const { incrementCartCount } = useCartStore();
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








   const handleAddToCart = async () => {
       if (isAddingToCart) return;








       setIsAddingToCart(true);








       try {
           // action-(thêm nến tùy chỉnh vào giỏ hàng)
           const result = await addToCartAction({
               color_id: selectedColor?.id,
               pack_id: selectedPack?.id,
               quantity: 1,
               scent_id: selectedScent?.id,
               size_id: selectedSize?.id,
               toppings_json: selectedToppings,
           });








           if ("error" in result && result.error) {
               toast.error(getFriendlyResponseError(result.error));
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
           className="page-section fade-section bg-[#6B1218] px-4 py-20 text-[#F5F0E8] sm:px-6 lg:px-16"
       >
           <div className="mx-auto max-w-[1200px]">
               <div className="section-title font-serif text-[2.5rem] font-light leading-[1.15] text-[#F5F0E8]">
                   Tạo nến của bạn
               </div>
               <div className="section-sub mt-2 text-[0.85rem] uppercase tracking-[0.1em] text-[#F5F0E8]/62">
                   Chọn từng thành phần
               </div>
               <div className="configurator mt-12 grid gap-8 rounded-2xl bg-[#2C1810] p-6 text-[#F5F0E8] shadow-[0_18px_50px_rgba(44,24,16,0.22)] md:grid-cols-2 md:p-8 lg:gap-12 lg:p-12">
                   <div className="config-panel">
                       <h3 className="mb-5 text-[0.72rem] uppercase tracking-[0.15em] text-[#F5F0E8]">
                           Thành phần
                       </h3>
                       <div className="option-group mb-8">
                           <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                               Hương liệu
                           </div>
                           <div className="options flex flex-wrap gap-2" id="scent-opts">
                               {scentOptions.length === 0 ? (
                                   <p className="text-sm text-[#F5F0E8]/65">
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
                                           className={`opt scent-chip inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                               ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                                               : "border-[#F5F0E8]/25 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                               }`}
                                       >
                                           <span
                                               className="size-2.5 rounded-full bg-[#F5F0E8]/75 shadow-[0_0_12px_rgba(245,240,232,0.28)]"
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
                               {colorOptions.length === 0 ? (
                                   <p className="text-sm text-[#F5F0E8]/65">
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
                                           className={`color-dot size-8 rounded-full border-2 shadow-[0_6px_14px_rgba(0,0,0,0.16)] transition hover:scale-110 ${active
                                               ? "scale-105 border-[#F5F0E8]"
                                               : "border-transparent"
                                               }`}
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
                               {sizeOptions.length === 0 ? (
                                   <p className="text-sm text-[#F5F0E8]/65">
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
                                           className={`opt rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                               ? "border-[#F5F0E8] bg-[#F5F0E8] font-semibold text-[#6B1218] shadow-[0_8px_18px_rgba(107,18,24,0.12)]"
                                               : "border-[#F5F0E8]/30 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                               }`}
                                       >
                                           {getSizeLabel(size)}
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
                               {packOptions.length === 0 ? (
                                   <p className="text-sm text-[#F5F0E8]/65">
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
                                           className={`opt rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
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
                           <div className="option-label mb-3 text-[0.8rem] text-[#F5F0E8]/78">
                               Topping
                           </div>
                           <div className="options flex flex-wrap gap-2" id="topping-opts">
                               {toppingOptions.length === 0 ? (
                                   <p className="text-sm text-[#F5F0E8]/65">
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
                                           className={`opt topping-chip inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[0.78rem] tracking-[0.05em] transition ${active
                                               ? "border-[#6B1218] bg-[#6B1218] text-[#F5F0E8]"
                                               : "border-[#F5F0E8]/25 bg-transparent text-[#F5F0E8] hover:border-[#F5F0E8]"
                                               }`}
                                       >
                                           <span className="topping-check w-3 text-center text-[0.65rem]">
                                               {active ? "☑" : "☐"}
                                           </span>
                                           {topping.name}
                                           {topping.price_extra_cents > 0 ? (
                                               <span className="text-[#F5F0E8]/65">
                                                   +{formatPrice(topping.price_extra_cents)}
                                               </span>
                                           ) : null}
                                       </button>
                                   );
                               })}
                           </div>
                       </div>
                   </div>
















                   <div>
                       <div className="preview-box flex min-h-[480px] flex-col items-start rounded-2xl bg-[#F5F0E8] p-6 text-left text-[#2C1810] md:p-7 lg:p-8">
                           <div
                               style={{ backgroundColor: selectedColorHex }}
                               className="mini-candle relative mx-auto mb-4 h-[120px] w-[70px] rounded-[5px_5px_2px_2px] shadow-[inset_-8px_0_16px_rgba(0,0,0,0.1),inset_3px_0_8px_rgba(255,255,255,0.35),0_18px_38px_rgba(44,24,16,0.18)] transition"
                           >
                               <div className="mini-wick absolute -top-3 left-1/2 h-2.5 w-0.5 -translate-x-1/2 bg-[#2C1810]" />
                               <div className="mini-flame absolute -top-[26px] left-1/2 h-4 w-2 -translate-x-1/2 animate-[candle-flicker_1.2s_ease-in-out_infinite] rounded-[50%_50%_30%_30%] bg-[radial-gradient(ellipse_at_50%_80%,#fff_0%,#FFE566_35%,#FF9A00_70%,transparent_100%)]" />
                           </div>
                           <div
                               className="preview-name mt-4 font-serif text-[1.6rem] font-semibold text-[#6B1218]"
                               id="prev-name"
                           >
                               {selectedScent?.name ?? "Chưa chọn hương"}
                           </div>
                           <div
                               className="preview-desc mb-4 text-[0.85rem] font-light italic text-[#8a6f5e]"
                               id="prev-desc"
                           >
                               {getScentDescription(selectedScent)}
                           </div>
                           <div className="preview-divider my-3 h-px w-full bg-[#6B1218]/15" />
                           <div className="preview-details w-full text-[0.82rem] leading-7 text-[#2C1810]">
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
                           <div className="preview-divider my-3 h-px w-full bg-[#6B1218]/15" />
















                           <div className="preview-toppings my-2 w-full" id="preview-toppings">
                               <div className="topping-list flex flex-wrap gap-2" id="topping-list">
                                   {selectedToppings.length === 0 ? (
                                       <div className="no-topping text-[0.8rem] italic text-[#a89080]">
                                           Chưa chọn topping
                                       </div>
                                   ) : (
                                       toppingOptions
                                           .filter((topping) => selectedToppings.includes(topping.id))
                                           .map((topping) => (
                                               <span
                                                   key={topping.id}
                                                   className="topping-tag rounded-full bg-[#6B1218]/15 px-3 py-1 text-[0.75rem] font-medium text-[#6B1218]"
                                               >
                                                   {topping.name}
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
                                   <span>Nến cơ bản:</span>
                                   <span>{formatPrice(basePrice)}</span>
                               </div>
                               {optionTotal > 0 ? (
                                   <div className="price-line flex justify-between gap-3 leading-6">
                                       <span>Tùy chọn:</span>
                                       <span>{formatPrice(optionTotal)}</span>
                                   </div>
                               ) : null}
                               {selectedSize ? (
                                   <div className="price-line flex justify-between gap-3 leading-6 text-[#2C1810]/65">
                                       <span>{getSizeLabel(selectedSize)}:</span>
                                       <span>+{formatPrice(selectedSize.price_extra_cents)}</span>
                                   </div>
                               ) : null}
                               {selectedScent?.price_extra_cents ? (
                                   <div className="price-line flex justify-between gap-3 leading-6 text-[#2C1810]/65">
                                       <span>{selectedScent.name}:</span>
                                       <span>+{formatPrice(selectedScent.price_extra_cents)}</span>
                                   </div>
                               ) : null}
                               {selectedColor?.price_extra_cents ? (
                                   <div className="price-line flex justify-between gap-3 leading-6 text-[#2C1810]/65">
                                       <span>{selectedColor.name}:</span>
                                       <span>+{formatPrice(selectedColor.price_extra_cents)}</span>
                                   </div>
                               ) : null}
                               {selectedPack?.price_extra_cents ? (
                                   <div className="price-line flex justify-between gap-3 leading-6 text-[#2C1810]/65">
                                       <span>{selectedPack.name}:</span>
                                       <span>+{formatPrice(selectedPack.price_extra_cents)}</span>
                                   </div>
                               ) : null}
                               <div className="price-line flex justify-between gap-3 leading-6">
                                   <span>Topping:</span>
                                   <span>{formatPrice(toppingTotal)}</span>
                               </div>
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
                               disabled={isAddingToCart}
                               className="add-btn w-full rounded-full bg-[#6B1218] px-8 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] shadow-[0_8px_24px_rgba(107,18,24,0.3)] transition hover:bg-[#4A0C10] hover:shadow-[0_12px_32px_rgba(107,18,24,0.5)] disabled:cursor-not-allowed disabled:opacity-65"
                           >
                               {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       </section>
   );
}





