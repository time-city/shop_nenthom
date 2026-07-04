"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getProductDetailsAction } from "../../lib/action/product.action";
import DetailCardProduct from "./detailCardProduct";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import type {
  ClientProductDetailDataInterface,
  ClientProductDetailInterface,
} from "../../interface/clientInterface";
import type { DetailCardModalProps } from "../../lib/types/client";
import styles from "../../styles/clientModal.module.css";

export default function DetailCardModal({
  isAuthenticated = false,
}: DetailCardModalProps) {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const pathname = usePathname();
  const router = useRouter();
  
  const [product, setProduct] = useState<ClientProductDetailInterface | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      getProductDetailsAction(productId).then((result) => {
        if ("success" in result && result.success) {
            const detailData = result.data as ClientProductDetailDataInterface;
            const rawProduct = (detailData.product ?? detailData) as Partial<ClientProductDetailInterface>;
            const rawOptions = (detailData.options ??
              rawProduct.options ??
              {}) as NonNullable<ClientProductDetailDataInterface["options"]>;
            
            const p: ClientProductDetailInterface = {
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

    router.replace(newPath, { scroll: false });
  };

  if (!productId) return null;

  if (loading || !product) {
    return (
      <Modal open={true} onClose={handleClose}>
        <Box className={styles.loadingShell}>
          <div className="flex h-32 w-64 items-center justify-center rounded-2xl bg-[#F8F0E4] shadow-2xl">
            <p className="font-serif text-lg text-[#6B1218]">Đang tải...</p>
          </div>
        </Box>
      </Modal>
    );
  }

  return (
    <DetailCardProduct 
        isAuthenticated={isAuthenticated}
        product={product} 
        onClose={handleClose} 
    />
  );
}
