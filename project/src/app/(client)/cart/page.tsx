"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CartItem from "../../../components/client/cartItem";
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
  const [cart, setCart] = useState<ClientCartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [step, setStep] = useState<CartPageStep>("cart");

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * Math.max(item.quantity, 1),
        0,
      ),
    [cart],
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
      const cartResult = result as ClientCartActionSuccessResponseInterface;
      setCart(cartResult.cart.items.map(mapCartItem));
    }

    setIsLoadingCart(false);
  }, []);

  useEffect(() => {
    void loadCart();
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

    setIsMutatingCart(true);

    try {
      // action-(cập nhật số lượng giỏ hàng)
      const result = await updateCartItemAction({
        itemId: targetItem.itemId,
        quantity: nextQuantity,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      await loadCart();
    } finally {
      setIsMutatingCart(false);
    }
  };

  const removeItem = async (index: number) => {
    if (isMutatingCart) return;

    const targetItem = cart[index];

    if (!targetItem?.itemId) return;

    const shouldRemove = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");

    if (!shouldRemove) return;

    setIsMutatingCart(true);

    try {
      // action-(xóa item khỏi giỏ hàng)
      const result = await removeCartItemAction({ itemId: targetItem.itemId });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      await loadCart();
    } finally {
      setIsMutatingCart(false);
    }
  };

  const applyPromo = () => {
    window.alert("Chức năng khuyến mãi sẽ được cập nhật sớm");
  };

  const completeOrder = async () => {
    if (isCheckingOut) return;

    window.alert("Đơn hàng được tạo thành công!");

    setIsCheckingOut(true);

    try {
      // action-(xóa toàn bộ giỏ hàng)
      const result = await clearCartAction();

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      setCart([]);
      setStep("cart");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (step === "checkout" && cart.length > 0) {
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
            items={cart}
            onBackToCart={() => setStep("cart")}
          />
        </section>
      </main>
    );
  }

  return (
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
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.name ?? item.scent}-${index}`}
                  index={index}
                  item={item}
                  disabled={isMutatingCart}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <CartSummary
              disabled={isMutatingCart}
              subtotal={subtotal}
              onApplyPromo={applyPromo}
              onCheckout={() => setStep("checkout")}
            />
          </section>
        )}
      </div>
    </main>
  );
}
