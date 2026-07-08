"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import CardProduct from "@/src/components/client/product/cardProduct";
import LoadingState from "@/src/components/ui/loadingState";
import { getProductsAction } from "@/src/lib/action/product.action";
import { callAction } from "@/src/lib/utils/callAction";
import type { ClientProductItemInterface } from "@/src/interface/clientInterface";

const getAvatarImage = (images: unknown) => {
  let rawUrl = "";
  
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawUrl = parsed[0];
      } else {
        rawUrl = images;
      }
    } catch {
      rawUrl = images;
    }
  } else if (Array.isArray(images)) {
    rawUrl = images.find(
      (image): image is string => typeof image === "string" && image.length > 0,
    ) ?? "";
  }

  if (rawUrl && rawUrl.includes("cloudinary.com") && rawUrl.includes("/upload/")) {
    return rawUrl.replace("/upload/", "/upload/w_400,c_scale,q_auto,f_auto/");
  }
  return rawUrl;
};

export default function CartSuggestedProducts() {
  const { data: fetchResult, isLoading: isSwrLoading, error: swrError } = useSWR(
    ['suggested-products'],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - cartSuggestedProducts: Fetching suggested products...");
      const result = await callAction(
        () => getProductsAction({ limit: 4 }),
        "Không thể tải sản phẩm bán chạy."
      );
      if ("error" in result && result.error) {
        throw new Error(String(result.error));
      }
      return result;
    }
  );

  let products: ClientProductItemInterface[] = [];
  if (fetchResult && "success" in fetchResult && fetchResult.success) {
    products = fetchResult.data.slice(0, 4);
  }

  useEffect(() => {
    if (fetchResult && "success" in fetchResult && fetchResult.success) {
      console.log("[Data Source] 🟢 UI UPDATED - cartSuggestedProducts: Displaying suggested products (from SWR Cache or Network)");
    }
  }, [fetchResult]);

  const isLoading = isSwrLoading;

  if (isLoading) {
    return (
      <div className="mt-10 sm:mt-16 w-full max-w-[900px] mx-auto">
        <h2 className="mb-5 font-serif text-[1.4rem] font-bold text-[#F5F0E8] sm:text-[1.8rem] text-center">
          Có Thể Bạn Sẽ Thích
        </h2>
        <LoadingState type="product" className="border-0 bg-transparent shadow-none px-0" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-10 sm:mt-16 w-full max-w-[900px] mx-auto border-t border-[#F5F0E8]/10 pt-8">
      <h2 className="mb-5 font-serif text-[1.4rem] font-bold text-[#F5F0E8] sm:text-[1.8rem] text-center">
        Có Thể Bạn Sẽ Thích
      </h2>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 sm:grid sm:grid-cols-4 sm:gap-5 scrollbar-hide px-2 sm:px-0">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="w-[70vw] shrink-0 snap-center sm:w-auto"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardProduct
              href={`/collection/${product.id}`}
              id={product.id}
              imageUrl={getAvatarImage(product.images)}
              index={index}
              name={product.name}
              price={product.base_price_cents}
              scentNote={
                product.description ??
                product.category?.description ??
                product.category?.name ??
                "Nến thơm thủ công."
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
