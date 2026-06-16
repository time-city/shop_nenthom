"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import CartItem from "@/src/components/client/cartItem";
import ModalDeleteConfirm from "@/src/components/admin/modalDeleteConfirm";
import CartSummary from "@/src/components/client/cartSummary";
import CheckoutForm from "@/src/components/client/checkoutForm";
import CheckoutSummary from "@/src/components/client/checkoutSummary";
import LoadingState from "@/src/components/ui/loadingState";
import { useCartStore } from "@/src/store/useCartStore";
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
  productId: item.product_id,
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
  const { setCartCount, setLastOrder } = useCartStore();
  const [cart, setCart] = useState<ClientCartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [step, setStep] = useState<CartPageStep>("cart");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discount_cents: number;
    subtotal_cents: number;
    total_cents: number;
  } | null>(null);

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

  // Reset applied discount when subtotal changes to avoid out-of-sync discounts
  useEffect(() => {
    if (appliedDiscount) {
      setAppliedDiscount(null);
      toast.info("Vui lòng áp dụng lại mã giảm giá do giỏ hàng đã thay đổi.");
    }
  }, [subtotal]);

  const loadCart = useCallback(async (cancelled: { value: boolean }) => {
    setIsLoadingCart(true);
    setError(null);

    // action-(lấy giỏ hàng)
    const result = await getOrCreateCartAction();
    console.log("[cart:getOrCreateCartAction]", result);

    if (cancelled.value) return;

    if ("error" in result && result.error) {
      const friendlyErr = getFriendlyResponseError(result.error);
      setError(friendlyErr);
      toast.error(friendlyErr);
      setCart([]);
      setIsLoadingCart(false);
      return;
    }

    if ("success" in result && result.success) {
      const cartResult = result as unknown as ClientCartActionSuccessResponseInterface;
      const mappedCart = cartResult.cart.items.map(mapCartItem);
      setCart(mappedCart);
      // Cập nhật badge số lượng trên header
      setCartCount(mappedCart.length);
      setSelectedItemIds(
        mappedCart.flatMap((item) => (item.itemId ? [item.itemId] : [])),
      );
    }

    setIsLoadingCart(false);
  }, [toast]);

  useEffect(() => {
    const cancelled = { value: false };
    void loadCart(cancelled);

    return () => {
      cancelled.value = true;
    };
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
        toast.error(getFriendlyResponseError(result.error));
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
        toast.error(getFriendlyResponseError(result.error));
        return;
      }

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      setDeleteIndex(null);
      const nextCart = cart.filter((_, itemIndex) => itemIndex !== index);
      setCart(nextCart);
      setCartCount(nextCart.length);
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
        toast.error(getFriendlyResponseError(result.error));
        return;
      }

      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
      setDeleteAllOpen(false);
      setCart([]);
      setCartCount(0);
      setSelectedItemIds([]);
    } finally {
      setIsMutatingCart(false);
    }
  };

  const applyPromo = async (code: string) => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã khuyến mãi.");
      return;
    }

    try {
      const response = await applyDiscountAction({
        code: code.trim(),
        subtotal_cents: subtotal,
      });

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
          return;
        }
        toast.error(getFriendlyResponseError(response.error));
        setAppliedDiscount(null);
        return;
      }

      if (response.success && response.data) {
        toast.success("Áp dụng mã khuyến mãi thành công!");
        setAppliedDiscount(response.data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã xảy ra lỗi khi áp dụng mã khuyến mãi");
    }
  };

  const completeOrder = async (shippingData: {
    address: string;
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
      toast.error("Vui lòng chọn sản phẩm muốn thanh toán");
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await createOrderAction({
        cart_item_ids: selectedCart.map((item) => item.itemId).filter((id): id is string => Boolean(id)),
        discount_code: appliedDiscount?.code || undefined,
        guest_email: shippingData.email,
        guest_phone: shippingData.phone,
        payment_method: shippingData.paymentMethod === "bank" ? "BANK_TRANSFER" : "COD",
        shipping_address: shippingData.address,
        shipping_city: shippingData.city,
        shipping_fullname: shippingData.fullname,
        shipping_note: shippingData.note || undefined,
        shipping_phone: shippingData.phone,
      });

      if ("error" in response && response.error) {
        toast.error(getFriendlyResponseError(response.error));
        return;
      }

      if (response.success && response.data) {
        // Lưu đơn hàng vào store Zustand (thay vì localStorage)
        setLastOrder(response.data);

        // Cập nhật lại giỏ hàng local và chuyển hướng sang trang xác nhận đơn hàng
        const nextCart = cart.filter(
          (item) => !item.itemId || !selectedItemIds.includes(item.itemId),
        );
        setCart(nextCart);
        setCartCount(nextCart.length);
        setSelectedItemIds([]);
        setAppliedDiscount(null);
        setStep("cart");

        router.push("/orderConfirmation");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (step === "checkout" && selectedCart.length > 0) {
    return (
      <main className="min-h-screen bg-[#F2E8D9] px-4 py-14 text-[#2C1810] sm:px-8 lg:px-12 xl:px-16">
        <section className="mb-8 flex min-h-[90px] flex-col justify-center gap-3 bg-[#6B1218] px-5 py-5 text-[#F5F0E8] sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="font-serif text-[2.4rem] sm:text-[3.2rem] font-light leading-tight">
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

          {error ? (
            <section className="rounded-2xl bg-[#F8F0E4] px-6 py-16 text-center shadow-[0_16px_36px_rgba(44,24,16,0.08)]">
              <div className="mb-4 text-5xl text-[#6B1218]">⚠️</div>
              <p className="mb-8 text-base text-[#6B1218] font-medium">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  const cancelled = { value: false };
                  void loadCart(cancelled);
                }}
                className="inline-flex rounded-full bg-[#6B1218] px-8 py-3 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.28)] transition hover:bg-[#4A0C10]"
              >
                Thử lại
              </button>
            </section>
          ) : isLoadingCart ? (
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
                appliedDiscountCode={appliedDiscount?.code}
                discountAmount={appliedDiscount?.discount_cents}
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
