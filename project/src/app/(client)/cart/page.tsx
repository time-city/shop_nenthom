"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import CartItem from "../../../components/client/cartItem";
import ModalDeleteConfirm from "../../../components/admin/modalDeleteConfirm";
import CartSummary from "../../../components/client/cartSummary";
import CheckoutForm from "../../../components/client/checkoutForm";
import CheckoutSummary from "../../../components/client/checkoutSummary";
import LoadingState from "../../../components/ui/loadingState";
import type {
 ClientCartActionItemInterface,
 ClientCartActionSuccessResponseInterface,
} from "../../../interface/clientInterface";
import {
 clearCartAction,
 getOrCreateCartAction,
 removeCartItemAction,
 updateCartItemAction,
} from "../../../lib/action/cart.action";
import type { CartPageStep, ClientCartItem } from "../../../lib/types/client";


const getCartItemPrice = (item: ClientCartActionItemInterface) =>
 item.product.base_price_cents +
 (item.scent?.price_extra_cents ?? 0) +
 (item.color?.price_extra_cents ?? 0) +
 (item.size?.price_extra_cents ?? 0) +
 (item.packaging?.price_extra_cents ?? 0);


const mapCartItem = (item: ClientCartActionItemInterface): ClientCartItem => ({
 color: item.color?.name,
 itemId: item.id,
 name: item.product.name,
 pack: item.packaging?.name,
 price: getCartItemPrice(item),
 productId: item.product_id,
 quantity: item.quantity,
 scent: item.scent?.name ?? item.product.name,
 size: item.size?.weight_gram
   ? `${item.size.name} (${item.size.weight_gram}g)`
   : item.size?.name,
});


export default function CartPage() {
 const router = useRouter();
 const { toast } = useToast();
 const [cart, setCart] = useState<ClientCartItem[]>([]);
 const [isCheckingOut, setIsCheckingOut] = useState(false);
 const [isLoadingCart, setIsLoadingCart] = useState(true);
 const [isMutatingCart, setIsMutatingCart] = useState(false);
 const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
 const [step, setStep] = useState<CartPageStep>("cart");
 const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
 const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
 const [deleteAllOpen, setDeleteAllOpen] = useState(false);


 const selectedCart = useMemo(
   () =>
     cart.filter((item) => item.itemId && selectedItemIds.includes(item.itemId)),
   [cart, selectedItemIds],
 );


 const subtotal = useMemo(
   () =>
     selectedCart.reduce(
       (sum, item) => sum + item.price * Math.max(item.quantity, 1),
       0,
     ),
   [selectedCart],
 );


 const loadCart = useCallback(async () => {
   setIsLoadingCart(true);


   // action-(lấy giỏ hàng)
   const result = await getOrCreateCartAction();
   console.log("[cart:getOrCreateCartAction]", result);


   if ("error" in result && result.error) {
     toast.error(result.error);
     setCart([]);
     setIsLoadingCart(false);
     return;
   }


   if ("success" in result && result.success) {
     const cartResult = result as unknown as ClientCartActionSuccessResponseInterface;
     const mappedCart = cartResult.cart.items.map(mapCartItem);
     setCart(mappedCart);
     setSelectedItemIds(
       mappedCart.flatMap((item) => (item.itemId ? [item.itemId] : []),
     ));
   }


   setIsLoadingCart(false);
 }, [toast]);


 useEffect(() => {
   const timerId = window.setTimeout(() => {
     void loadCart();
   }, 0);


   return () => window.clearTimeout(timerId);
 }, [loadCart]);


 const updateQuantity = async (index: number, change: number) => {
   if (isMutatingCart) return;


   const targetItem = cart[index];


   if (!targetItem?.itemId) return;


   const nextQuantity = targetItem.quantity + change;


   if (nextQuantity <= 0) {
     await removeItem(index);
     return;
   }


   const previousCart = cart;


   setCart((currentCart) =>
     currentCart.map((item, itemIndex) =>
       itemIndex === index ? { ...item, quantity: nextQuantity } : item,
     ),
   );
   setIsMutatingCart(true);


   try {
     // action-(cập nhật số lượng giỏ hàng)
     const result = await updateCartItemAction({
       itemId: targetItem.itemId,
       quantity: nextQuantity,
     });


     if ("error" in result && result.error) {
       setCart(previousCart);
       toast.error(result.error);
       return;
     }
   } finally {
     setIsMutatingCart(false);
   }
 };


 const removeItem = (index: number) => {
   setDeleteIndex(index);
 };


 const toggleSelectedItem = (index: number, selected: boolean) => {
   const targetItem = cart[index];


   if (!targetItem?.itemId || isMutatingCart) return;


   setSelectedItemIds((currentIds) => {
     if (selected) return Array.from(new Set([...currentIds, targetItem.itemId!]));


     return currentIds.filter((itemId) => itemId !== targetItem.itemId);
   });
 };


 const handleConfirmDelete = async () => {
   if (deleteIndex === null || isMutatingCart) return;


   const index = deleteIndex;
   const targetItem = cart[index];


   if (!targetItem?.itemId) return;


   setIsMutatingCart(true);


   try {
     // action-(xóa item khỏi giỏ hàng)
     const result = await removeCartItemAction({ itemId: targetItem.itemId });


     if ("error" in result && result.error) {
       toast.error(result.error);
       return;
     }


     toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
     setDeleteIndex(null);
     setCart((currentCart) => currentCart.filter((_, itemIndex) => itemIndex !== index));
     setSelectedItemIds((currentIds) =>
       currentIds.filter((itemId) => itemId !== targetItem.itemId),
     );
   } finally {
     setIsMutatingCart(false);
   }
 };


 const handleConfirmDeleteSelected = async () => {
   if (selectedCart.length === 0 || isMutatingCart) return;


   setIsMutatingCart(true);


   try {
     for (const item of selectedCart) {
       if (!item.itemId) continue;


       const result = await removeCartItemAction({ itemId: item.itemId });


       if ("error" in result && result.error) {
         toast.error(result.error);
         return;
       }
     }


     toast.success("Đã xóa sản phẩm đã chọn khỏi giỏ hàng");
     setDeleteSelectedOpen(false);
     setCart((currentCart) =>
       currentCart.filter((item) => !item.itemId || !selectedItemIds.includes(item.itemId)),
     );
     setSelectedItemIds([]);
   } finally {
     setIsMutatingCart(false);
   }
 };


 const handleConfirmClearCart = async () => {
   if (isMutatingCart) return;


   setIsMutatingCart(true);


   try {
     const result = await clearCartAction();


     if ("error" in result && result.error) {
       toast.error(result.error);
       return;
     }


     toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
     setDeleteAllOpen(false);
     setCart([]);
     setSelectedItemIds([]);
   } finally {
     setIsMutatingCart(false);
   }
 };


 const applyPromo = () => {
   toast.info("Chức năng khuyến mãi sẽ được cập nhật sớm");
 };


  const completeOrder = async (shippingData: {
    address: string;
    city: string;
    email: string;
    fullname: string;
    note: string;
    paymentMethod: import("../../../lib/types/client").CartPaymentMethod;
    phone: string;
    zip: string;
  }) => {
    if (isCheckingOut) return;
    if (selectedCart.length === 0) {
      toast.error("Vui lòng chọn sản phẩm muốn thanh toán");
      return;
    }

    setIsCheckingOut(true);

    try {
      // 1. Tạo mã đơn hàng dạng CC-XXXXXX
      const orderNumber = `CC-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Tạo đối tượng order để hiển thị ở trang orderConfirmation
      const order = {
        orderNumber,
        createdAt: new Date().toISOString(),
        paymentMethod: shippingData.paymentMethod,
        fullname: shippingData.fullname,
        address: shippingData.address,
        city: shippingData.city,
        zip: shippingData.zip,
        phone: shippingData.phone,
        email: shippingData.email,
        note: shippingData.note,
        items: selectedCart.map((item) => ({
          scent: item.scent,
          size: item.size || "Mặc định",
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          color: item.color,
          pack: item.pack,
        })),
        subtotal: subtotal,
        shipping: 30000,
        total: subtotal + 30000,
        isGuest: true,
      };

      // 3. Lưu đơn hàng vào localStorage để trang orderConfirmation đọc
      localStorage.setItem("lumiere-order", JSON.stringify(order));

      // 4. Xóa các sản phẩm đã thanh toán khỏi giỏ hàng của Database
      for (const item of selectedCart) {
        if (!item.itemId) continue;

        const result = await removeCartItemAction({ itemId: item.itemId });

        if ("error" in result && result.error) {
          toast.error(result.error);
          return;
        }
      }

      // 5. Cập nhật lại giỏ hàng local và chuyển hướng sang trang xác nhận đơn hàng
      setCart((currentCart) =>
        currentCart.filter((item) => !item.itemId || !selectedItemIds.includes(item.itemId)),
      );
      setSelectedItemIds([]);
      setStep("cart");
      
      router.push("/orderConfirmation");
    } finally {
      setIsCheckingOut(false);
    }
  };


 if (step === "checkout" && selectedCart.length > 0) {
   return (
     <main className="min-h-screen bg-[#F2E8D9] px-4 py-14 text-[#2C1810] sm:px-8 lg:px-12 xl:px-16">
       <section className="mb-8 flex min-h-[90px] flex-col justify-center gap-3 bg-[#6B1218] px-5 py-5 text-[#F5F0E8] sm:px-8 lg:flex-row lg:items-center lg:justify-between">
         <h1 className="font-serif text-[2rem] font-bold leading-tight">
           Thanh Toán
         </h1>
         <div
           className="flex flex-wrap items-center gap-2 text-[0.78rem] text-[#F5F0E8]/60"
           aria-label="Breadcrumb"
         >
           <span>Giỏ hàng</span>
           <span>→</span>
           <span className="font-medium text-[#F5F0E8]">Thanh toán</span>
           <span>→</span>
           <span>Hoàn tất</span>
         </div>
       </section>


       <section className="grid gap-8 xl:grid-cols-[2fr_1fr] xl:gap-10">
         <CheckoutForm isSubmitting={isCheckingOut} onComplete={completeOrder} />
         <CheckoutSummary
           isSubmitting={isCheckingOut}
           items={selectedCart}
           onBackToCart={() => setStep("cart")}
         />
       </section>
     </main>
   );
 }


 return (
   <>
     <main className="min-h-screen bg-[#F2E8D9] text-[#2C1810]">
       <div className="px-4 py-14 sm:px-8 lg:px-12 xl:px-16">
         <div className="mb-10 flex flex-wrap items-center justify-between gap-4 lg:mb-14">
           <h1 className="w-fit border-b-[3px] border-[#6B1218] pb-3 font-serif text-[2.35rem] font-bold leading-tight text-[#2C1810] sm:text-[2.7rem]">
             Giỏ Hàng
           </h1>
           <Link
             href="/#collection"
             className="text-sm font-light text-[#8B7355] transition hover:text-[#6B1218]"
           >
             ← Tiếp tục mua sắm
           </Link>
         </div>


         {isLoadingCart ? (
           <section className="rounded-2xl bg-[#F8F0E4] px-6 py-16 text-center shadow-[0_16px_36px_rgba(44,24,16,0.08)]">
             <LoadingState
               label="Đang tải giỏ hàng..."
               className="min-h-40 border-0 bg-transparent shadow-none"
             />
           </section>
         ) : cart.length === 0 ? (
           <section className="rounded-2xl bg-[#F8F0E4] px-6 py-16 text-center shadow-[0_16px_36px_rgba(44,24,16,0.08)]">
             <div className="mb-4 text-5xl text-[#6B4C35]/35">🛍</div>
             <p className="mb-8 text-base text-[#6B4C35]">
               Giỏ hàng của bạn đang trống
             </p>
             <Link
               href="/#collection"
               className="inline-flex rounded-full bg-[#6B1218] px-8 py-3 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.28)] transition hover:bg-[#4A0C10]"
             >
               Bắt Đầu Mua Sắm
             </Link>
           </section>
         ) : (
           <section className="grid gap-8 xl:grid-cols-[2fr_1fr] xl:gap-10">
             <div className="min-h-[360px] overflow-hidden rounded-2xl bg-[#F8F0E4] shadow-[0_16px_36px_rgba(44,24,16,0.08)]">
               <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6B4C35]/10 px-5 py-4 sm:px-7">
                 <p className="text-sm text-[#6B4C35]">
                   Đã chọn {selectedCart.length}/{cart.length} sản phẩm
                 </p>
                 <div className="flex flex-wrap gap-2">
                   <button
                     type="button"
                     onClick={() => setDeleteSelectedOpen(true)}
                     disabled={isMutatingCart || selectedCart.length === 0}
                     className="rounded-full border border-[#6B1218]/35 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-widest text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-45"
                   >
                     Xóa đã chọn
                   </button>
                   <button
                     type="button"
                     onClick={() => setDeleteAllOpen(true)}
                     disabled={isMutatingCart || cart.length === 0}
                     className="rounded-full bg-[#6B1218] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-widest text-[#F5F0E8] transition hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-45"
                   >
                     Xóa tất cả
                   </button>
                 </div>
               </div>
               {cart.map((item, index) => (
                 <CartItem
                   key={`${item.name ?? item.scent}-${index}`}
                   index={index}
                   item={item}
                   disabled={isMutatingCart}
                   onQuantityChange={updateQuantity}
                   onSelectChange={toggleSelectedItem}
                   selected={Boolean(item.itemId && selectedItemIds.includes(item.itemId))}
                 />
               ))}
             </div>


             <CartSummary
               disabled={isMutatingCart || selectedCart.length === 0}
               subtotal={subtotal}
               onApplyPromo={applyPromo}
               onCheckout={() => setStep("checkout")}
             />
           </section>
         )}
       </div>
     </main>


     <ModalDeleteConfirm
       open={deleteIndex !== null}
       itemName={deleteIndex !== null ? (cart[deleteIndex]?.name ?? cart[deleteIndex]?.scent ?? "sản phẩm") : ""}
       isDeleting={isMutatingCart}
       title="Xóa sản phẩm khỏi giỏ hàng?"
       confirmLabel="Xóa sản phẩm"
       onClose={() => setDeleteIndex(null)}
       onConfirm={handleConfirmDelete}
     />


     <ModalDeleteConfirm
       open={deleteSelectedOpen}
       itemName={
         selectedCart.length === 1
           ? (selectedCart[0]?.name ?? selectedCart[0]?.scent ?? "sản phẩm đã chọn")
           : `${selectedCart.length} sản phẩm đã chọn`
       }
       isDeleting={isMutatingCart}
       title="Xóa sản phẩm đã chọn khỏi giỏ hàng?"
       confirmLabel="Xóa đã chọn"
       onClose={() => setDeleteSelectedOpen(false)}
       onConfirm={handleConfirmDeleteSelected}
     />


     <ModalDeleteConfirm
       open={deleteAllOpen}
       description="Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng? Thao tác này không thể hoàn tác."
       isDeleting={isMutatingCart}
       title="Xóa tất cả sản phẩm khỏi giỏ hàng?"
       confirmLabel="Xóa tất cả"
       onClose={() => setDeleteAllOpen(false)}
       onConfirm={handleConfirmClearCart}
     />
   </>
 );
}





