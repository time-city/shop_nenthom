"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useToast } from "@/src/components/ui/toastProvider";
import {
  getFriendlyResponseError,
  isUserInputError,
} from "@/src/lib/utils/errorMessage";
import CartItem from "@/src/components/client/cart/cartItem";
import dynamic from "next/dynamic";
const ModalDeleteConfirmClient = dynamic(() => import("@/src/components/client/common/modalDeleteConfirmClient"), { ssr: false });
import CartSummary from "@/src/components/client/cart/cartSummary";
import CheckoutForm from "@/src/components/client/checkout/checkoutForm";
import CheckoutSummary from "@/src/components/client/checkout/checkoutSummary";
import LoadingState from "@/src/components/ui/loadingState";
import CartSuggestedProducts from "@/src/components/client/cart/cartSuggestedProducts";
import { useCartStore } from "@/src/store/useCartStore";
import { useOrderTrackingSocket } from "@/src/hooks/useOrderTrackingSocket";
import type {
  ClientCartActionItemInterface,
  ClientCartActionSuccessResponseInterface,
} from "@/src/interface/clientInterface";
import {
  clearCartAction,
  getOrCreateCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/src/lib/action/cart.action";
import { createOrderAction } from "@/src/lib/action/order.action";
import { applyDiscountAction } from "@/src/lib/action/discount.action";
import type { CartPageStep, ClientCartItem, CartPaymentMethod } from "@/src/lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";

const getFirstImage = (images: unknown) => {
  if (Array.isArray(images) && typeof images[0] === "string") {
    return images[0];
  }
  if (typeof images === "string") {
    return images;
  }
  return "";
};

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
  productId: item.product.id,
  quantity: item.quantity,
  scent: item.scent?.name ?? item.product.name,
  size: item.size?.weight_gram
    ? `${item.size.name} (${item.size.weight_gram}g)`
    : item.size?.name,
  imageUrl: getFirstImage(item.product.images),
});

export default function CartClient() {
  const router = useRouter();
  const { toast } = useToast();
  const setCartCount = useCartStore((state) => state.setCartCount);
  const setLastOrder = useCartStore((state) => state.setLastOrder);
  const incrementOrderCount = useCartStore((state) => state.incrementOrderCount);
  const [cart, setCart] = useState<ClientCartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [step, setStep] = useState<CartPageStep>("cart");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const pendingUpdatesRef = useRef<Record<string, NodeJS.Timeout>>({});
  const appliedDiscount = useCartStore((state) => state.appliedDiscount);
  const setAppliedDiscount = useCartStore((state) => state.setAppliedDiscount);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<any>(null);

  useOrderTrackingSocket({
    orderId: pendingPaymentOrder?.orderId,
    onPaymentSuccess: (data) => {
      setPendingPaymentOrder(null);
      router.push("/orderConfirmation");
    },
  });

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

  const { data: cartResult, isLoading: isLoadingCart, error: swrError, mutate: mutateCart } = useSWR(
    ['client-cart'],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - cartClient: Fetching cart data...");
      return await callAction(() => getOrCreateCartAction(), "Không thể tải giỏ hàng. Vui lòng thử lại sau.");
    }
  );

  useEffect(() => {
    if (swrError) {
      const friendlyErr = swrError instanceof Error ? swrError.message : String(swrError);
      setError(friendlyErr);
      toast.error(friendlyErr);
      setCart([]);
    } else if (cartResult && 'error' in cartResult && cartResult.error) {
      const friendlyErr = getFriendlyResponseError(cartResult.error);
      setError(friendlyErr);
      toast.error(friendlyErr);
      setCart([]);
    }
  }, [swrError, cartResult, toast]);

  useEffect(() => {
    if (cartResult && 'success' in cartResult && cartResult.success) {
      console.log("[Data Source] 🟢 UI UPDATED - cartClient: Displaying cart data (from SWR Cache or Network)");
      const cartResultData = cartResult as unknown as ClientCartActionSuccessResponseInterface;
      const mappedCart = cartResultData.cart.items.map(mapCartItem);
      setCart(mappedCart);
      setCartCount(mappedCart.length);
      setSelectedItemIds((prev) => 
        prev.length === 0 ? mappedCart.flatMap((item) => (item.itemId ? [item.itemId] : [])) : prev
      );
    }
  }, [cartResult, setCartCount]);

  // Reset applied discount when subtotal changes to avoid out-of-sync discounts
  useEffect(() => {
    if (!isLoadingCart && appliedDiscount && subtotal !== appliedDiscount.subtotal_cents) {
      setAppliedDiscount(null);
    }
  }, [subtotal, appliedDiscount, isLoadingCart, setAppliedDiscount]);



  useEffect(() => {
    const pendingUpdates = pendingUpdatesRef.current;
    return () => {
      Object.values(pendingUpdates).forEach(clearTimeout);
    };
  }, []);

  const updateQuantity = async (index: number, change: number) => {
    const targetItem = cart[index];

    if (!targetItem?.itemId) return;

    const nextQuantity = targetItem.quantity + change;

    if (nextQuantity <= 0) {
      await removeItem(index);
      return;
    }

    // Cập nhật state UI ngay lập tức để trải nghiệm mượt mà không bị đứng
    setCart((currentCart) =>
      currentCart.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: nextQuantity } : item,
      ),
    );

    const itemId = targetItem.itemId;

    if (pendingUpdatesRef.current[itemId]) {
      clearTimeout(pendingUpdatesRef.current[itemId]);
    } else {
      setPendingCount((prev) => prev + 1);
    }

    pendingUpdatesRef.current[itemId] = setTimeout(async () => {
      delete pendingUpdatesRef.current[itemId];
      setPendingCount((prev) => Math.max(0, prev - 1));
      setIsMutatingCart(true);

      try {
        // action-(cập nhật số lượng giỏ hàng)
        const result = await callAction(() => updateCartItemAction({
          itemId,
          quantity: nextQuantity,
        }), "Không thể cập nhật sản phẩm trong giỏ hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          await mutateCart();
          toast.error(getFriendlyResponseError(result.error));
        } else {
          void mutateCart(); // revalidate cache silently
        }
      } catch (err) {
        await mutateCart();
        toast.error(err instanceof Error ? err.message : "Cập nhật giỏ hàng thất bại");
      } finally {
        setIsMutatingCart(false);
      }
    }, 500);
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

    // 1. Lưu state cũ
    const previousCart = [...cart];
    const previousSelected = [...selectedItemIds];

    // 2. Cập nhật state UI ngay lập tức
    const nextCart = cart.filter((_, itemIndex) => itemIndex !== index);
    setCart(nextCart);
    setCartCount(nextCart.length);
    setSelectedItemIds((currentIds) =>
      currentIds.filter((itemId) => itemId !== targetItem.itemId),
    );
    setDeleteIndex(null);
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");

    // 3. Gọi API ở background
    setIsMutatingCart(true);

    try {
      // action-(xóa item khỏi giỏ hàng)
      const result = await callAction(() => removeCartItemAction({ itemId: targetItem.itemId }), "Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        // Rollback
        setCart(previousCart);
        setCartCount(previousCart.length);
        setSelectedItemIds(previousSelected);
        toast.error(getFriendlyResponseError(result.error));
      } else {
        void mutateCart();
      }
    } catch (err) {
      // Rollback
      setCart(previousCart);
      setCartCount(previousCart.length);
      setSelectedItemIds(previousSelected);
      toast.error(err instanceof Error ? err.message : "Xóa giỏ hàng thất bại");
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

        const result = await callAction(() => removeCartItemAction({ itemId: item.itemId }), "Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          toast.error(getFriendlyResponseError(result.error));
          return;
        }
      }

      toast.success("Đã xóa sản phẩm đã chọn khỏi giỏ hàng");
      setDeleteSelectedOpen(false);
      const nextCart = cart.filter(
        (item) => !item.itemId || !selectedItemIds.includes(item.itemId),
      );
      setCart(nextCart);
      setCartCount(nextCart.length);
      setSelectedItemIds([]);
      void mutateCart();
    } finally {
      setIsMutatingCart(false);
    }
  };

  const handleConfirmClearCart = async () => {
    if (isMutatingCart) return;

    setIsMutatingCart(true);

    try {
      const result = await callAction(() => clearCartAction(), "Không thể xóa giỏ hàng. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        toast.error(getFriendlyResponseError(result.error));
        return;
      }

      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
      setDeleteAllOpen(false);
      setCart([]);
      setCartCount(0);
      setSelectedItemIds([]);
      void mutateCart();
    } finally {
      setIsMutatingCart(false);
    }
  };

  const applyPromo = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!code.trim()) {
      return { success: false, error: "Vui lòng nhập mã khuyến mãi." };
    }

    try {
      const response = await callAction(() => applyDiscountAction({
        code: code.trim(),
        subtotal_cents: subtotal,
      }), "Không thể áp dụng mã giảm giá. Vui lòng thử lại sau.");

      if ("error" in response && response.error) {
        if (response.error === "Vui lòng đăng nhập để sử dụng mã giảm giá") {
          toast.warning({
            title: "Yêu cầu đăng nhập",
            message: "Bạn cần đăng nhập để sử dụng mã giảm giá. Đang chuyển hướng..."
          });
          setAppliedDiscount(null);
          setTimeout(() => {
            router.push("/login?redirect=/cart");
          }, 1500);
          return { success: false };
        }
        setAppliedDiscount(null);
        return { success: false, error: getFriendlyResponseError(response.error) };
      }

      if (response.success && response.data) {
        setAppliedDiscount(response.data);
        return { success: true };
      }
      return { success: false, error: "Mã khuyến mãi không hợp lệ." };
    } catch (err) {
      setAppliedDiscount(null);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Đã xảy ra lỗi khi áp dụng mã khuyến mãi",
      };
    }
  };

  const completeOrder = async (shippingData: {
    address: string;
    ward: string;
    district: string;
    city: string;
    email: string;
    fullname: string;
    note: string;
    paymentMethod: CartPaymentMethod;
    phone: string;
    zip: string;
  }) => {
    if (isCheckingOut) return;
    if (selectedCart.length === 0) {
      setError("Vui lòng chọn sản phẩm muốn thanh toán");
      setStep("cart");
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await callAction(() => createOrderAction({
        cart_item_ids: selectedCart.map((item) => item.itemId).filter((id): id is string => Boolean(id)),
        discount_code: appliedDiscount?.code || undefined,
        guest_email: shippingData.email,
        guest_phone: shippingData.phone,
        payment_method: shippingData.paymentMethod === "bank" ? "BANK_TRANSFER" : "COD",
        shipping_address: shippingData.address,
        shipping_ward: shippingData.ward,
        shipping_district: shippingData.district,
        shipping_city: shippingData.city,
        shipping_fullname: shippingData.fullname,
        shipping_note: shippingData.note || undefined,
        shipping_phone: shippingData.phone,
      }), "Không thể đặt hàng. Vui lòng thử lại sau.");

      if ("error" in response && response.error) {
        const message = getFriendlyResponseError(response.error);
        if (isUserInputError(message)) {
          setError(message);
          setStep("cart");
        } else {
          toast.error(message);
        }
        return;
      }

      if (response.success && response.data) {
        // Lưu đơn hàng vào store Zustand (thay vì localStorage)
        setLastOrder(response.data);
        incrementOrderCount();

        // Cập nhật lại giỏ hàng local và chuyển hướng sang trang xác nhận đơn hàng
        const nextCart = cart.filter(
          (item) => !item.itemId || !selectedItemIds.includes(item.itemId),
        );
        setCart(nextCart);
        setCartCount(nextCart.length);
        setSelectedItemIds([]);
        setAppliedDiscount(null);

        if (shippingData.paymentMethod === "bank") {
          setPendingPaymentOrder(response.data);
        } else {
          setStep("cart");
          toast.success("Đặt hàng thành công!");
          router.push("/orderConfirmation");
        }
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if ((step === "checkout" && selectedCart.length > 0) || pendingPaymentOrder) {
    return (
      <main
        className="min-h-screen relative text-[#F5F0E8] bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/assets/rose_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#3a080f]/80 backdrop-blur-[2px]" />

        <div className="relative z-10 px-4 pt-28 pb-14 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="group flex items-center gap-2 text-sm font-light text-[#F5F0E8]/80 transition hover:text-[#FFFFFF]"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span> Quay lại giỏ hàng
            </button>
          </div>

          <section className="mb-8 flex min-h-[90px] flex-col justify-center gap-3 bg-black/30 backdrop-blur-md border border-[#F5F0E8]/10 rounded-3xl px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3.5">
              <h1 className="font-serif text-[2.4rem] sm:text-[3.2rem] font-light leading-tight">
                Thanh Toán
              </h1>
            </div>
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
              onApplyPromo={applyPromo}
              appliedDiscountCode={appliedDiscount?.code}
              discountAmount={appliedDiscount?.discount_cents}
              discountType={appliedDiscount?.type}
            />
          </section>

          {/* Popup QR Thanh Toán */}
          {pendingPaymentOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-[#6B1218] border border-[#E5C07B]/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
                <button 
                  onClick={() => {
                    setPendingPaymentOrder(null);
                    router.push("/orderConfirmation");
                  }}
                  className="absolute top-4 right-4 text-[#F5F0E8]/50 hover:text-[#F5F0E8]"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-center space-y-4">
                  <h3 className="text-[#E5C07B] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Mã Thanh Toán QR
                  </h3>
                  <div className="bg-white p-3 rounded-xl inline-block">
                    <img 
                      src={`https://vietqr.app/img?bank=MBBank&acc=0001118294755&template=qronly&amount=${pendingPaymentOrder.total}&des=CHAM${pendingPaymentOrder.orderId.replace(/-/g, '').substring(0,12).toUpperCase()}&showinfo=true&holder=NGUYEN%20THANH%20NHAN`} 
                      alt="QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-sm font-light text-[#F5F0E8]/80 leading-relaxed">
                    Vui lòng dùng app ngân hàng quét mã để thanh toán.<br/>
                    Giao diện sẽ <strong className="text-[#E5C07B]">tự động chuyển</strong> khi nhận được tiền.
                  </p>
                  <div className="bg-black/50 p-3 rounded-xl border border-[#F5F0E8]/10 text-sm text-left space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#F5F0E8]/60">Số tiền:</span>
                      <strong className="text-[#E5C07B]">{pendingPaymentOrder.total.toLocaleString("vi-VN")}đ</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#F5F0E8]/60">Nội dung:</span>
                      <strong className="text-[#F5F0E8]">CHAM{pendingPaymentOrder.orderId.replace(/-/g, '').substring(0,12).toUpperCase()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className="min-h-screen text-[#F5F0E8] relative bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/assets/option_background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative z-10 px-4 pt-28 pb-14 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 lg:mb-14">
            <h1 className="w-fit border-b-[3px] border-[#D6A15F] pb-3 font-serif text-[1.5rem] font-bold leading-tight text-[#F5F0E8] sm:text-[2rem]">
              Giỏ Hàng
            </h1>
            <Link
              href="/#collection"
              className="group flex items-center gap-2 text-sm font-light text-[#F5F0E8]/80 transition hover:text-[#FFFFFF]"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span> Tiếp tục mua sắm
            </Link>
          </div>

          {error ? (
            <section className="rounded-3xl bg-black/30 backdrop-blur-md border border-[#F5F0E8]/10 px-6 py-16 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <div className="mb-4 text-5xl text-[#ff6b6b]">⚠️</div>
              <p className="mb-8 text-base text-[#F5F0E8] font-medium">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  void mutateCart();
                }}
                className="inline-flex rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-8 py-3 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#2C1810] shadow-[0_10px_24px_rgba(214,161,95,0.3)] transition hover:-translate-y-0.5"
              >
                Thử lại
              </button>
            </section>
          ) : isLoadingCart ? (
            <section className="rounded-3xl bg-black/30 backdrop-blur-md border border-[#F5F0E8]/10 p-4 sm:p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <LoadingState
                type="cart"
                label="Đang tải giỏ hàng..."
                className="border-0 bg-transparent shadow-none"
              />
            </section>
          ) : cart.length === 0 ? (
            <section className="rounded-3xl bg-black/30 backdrop-blur-md border border-[#F5F0E8]/10 px-6 py-16 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <div className="mb-4 text-5xl opacity-80">🛍</div>
              <p className="mb-8 text-base text-[#F5F0E8]/80 font-light">
                Giỏ hàng của bạn đang trống
              </p>
              <Link
                href="/#collection"
                className="inline-flex rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-8 py-3 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#2C1810] shadow-[0_10px_24px_rgba(214,161,95,0.3)] transition hover:-translate-y-0.5"
              >
                Bắt Đầu Mua Sắm
              </Link>
            </section>
          ) : (
            <section className="grid gap-8 xl:grid-cols-[2fr_1fr] xl:gap-10">
              <div className="min-h-[360px] overflow-hidden rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5F0E8]/10 px-5 py-4 sm:px-7">
                  <p className="text-sm text-[#F5F0E8]/70">
                    Đã chọn {selectedCart.length}/{cart.length} sản phẩm
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteSelectedOpen(true)}
                      disabled={isMutatingCart || selectedCart.length === 0}
                      className="rounded-full border border-[#D6A15F]/50 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-widest text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Xóa đã chọn
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteAllOpen(true)}
                      disabled={isMutatingCart || cart.length === 0}
                      className="rounded-full bg-red-900/50 border border-red-500/30 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-widest text-red-200 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-45"
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
                disabled={isMutatingCart || selectedCart.length === 0 || pendingCount > 0}
                subtotal={subtotal}
                onCheckout={() => setStep("checkout")}
              />
            </section>
          )}

          <CartSuggestedProducts />
        </div>
      </main>

      <ModalDeleteConfirmClient
        open={deleteIndex !== null}
        itemName={deleteIndex !== null ? (cart[deleteIndex]?.name ?? cart[deleteIndex]?.scent ?? "sản phẩm") : ""}
        isDeleting={isMutatingCart}
        title="Xóa sản phẩm khỏi giỏ hàng?"
        confirmLabel="Xóa sản phẩm"
        onClose={() => setDeleteIndex(null)}
        onConfirm={handleConfirmDelete}
      />

      <ModalDeleteConfirmClient
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

      <ModalDeleteConfirmClient
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
