"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getProductDetailsAction } from "../../lib/action/product.action";
import DetailCardProduct, { type ProductDetail } from "./detailCardProduct";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

export default function DetailCardModal() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const pathname = usePathname();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      getProductDetailsAction(productId).then((result) => {
        if ("success" in result && result.success) {
            const detailData = result.data as any;
            const rawProduct = (detailData.product ?? detailData) as any;
            const rawOptions = (detailData.options ?? rawProduct.options ?? {}) as any;
            
            const p: ProductDetail = {
              base_price_cents: rawProduct.base_price_cents ?? 0,
              category: rawProduct.category ?? null,
              description: rawProduct.description ?? null,
              id: rawProduct.id ?? productId,
              images: rawProduct.images ?? [],
              name: rawProduct.name ?? "Sản phẩm",
              options: {
                packagings: rawOptions.packagings ?? [],
                scents: rawOptions.scents ?? [],
                sizes: rawOptions.sizes ?? [],
                toppings: rawOptions.toppings ?? [],
                waxColors: rawOptions.waxColors ?? rawOptions.colors ?? [],
              },
            };
            setProduct(p);
        } else {
            setProduct(null);
        }
        setLoading(false);
      });
    } else {
      setProduct(null);
    }
  }, [productId]);

  const handleClose = () => {
    // Xoá productId khỏi URL để tắt modal mà KHÔNG chuyển trang
    const params = new URLSearchParams(searchParams.toString());
    params.delete("productId");
    const query = params.toString();
    const newPath = query ? `${pathname}?${query}` : pathname;
    
    window.history.pushState(null, "", newPath);
  };

  if (!productId) return null;

  if (loading || !product) {
    return (
      <Modal open={true} onClose={handleClose}>
        <Box
          sx={{
            left: "50%",
            outline: "none",
            position: "absolute",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex h-32 w-64 items-center justify-center rounded-2xl bg-[#F8F0E4] shadow-2xl">
            <p className="font-serif text-lg text-[#6B1218]">Đang tải...</p>
          </div>
        </Box>
      </Modal>
    );
  }

  return (
    <DetailCardProduct 
        product={product} 
        onClose={handleClose} 
    />
  );
}
