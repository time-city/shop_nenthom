"use client";


import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getProductDetailsAction } from "../../../lib/action/product.action";
import DetailCardProduct from "@/src/components/client/product/detailCardProduct";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import LoadingState from "../../ui/loadingState";
import type {
 ClientProductDetailDataInterface,
 ClientProductDetailInterface,
} from "../../../interface/clientInterface";
import type { DetailCardModalProps } from "../../../lib/types/client";
import styles from "../../../styles/clientModal.module.css";
import { callAction } from "@/src/lib/utils/callAction";


export default function DetailCardModal({
 isAuthenticated = false,
}: DetailCardModalProps) {
 const searchParams = useSearchParams();
 const productId = searchParams.get("productId");
 const pathname = usePathname();
 const router = useRouter();
 const [product, setProduct] = useState<ClientProductDetailInterface | null>(null);
 const [loading, setLoading] = useState(false);
 const cacheRef = useRef<Map<string, ClientProductDetailInterface>>(new Map());


 useEffect(() => {
   let ignore = false;


   const timerId = window.setTimeout(() => {
     if (!productId) {
       setProduct(null);
       setLoading(false);
       return;
     }

     if (cacheRef.current.has(productId)) {
       setProduct(cacheRef.current.get(productId)!);
       setLoading(false);
       return;
     }


     setLoading(true);
     callAction(() => getProductDetailsAction(productId), "Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.").then((result) => {
       if (ignore) return;


       if ("success" in result && result.success) {
           const detailData = result.data as ClientProductDetailDataInterface;
           const { options, product: rawProduct } = detailData;
          
           const p: ClientProductDetailInterface = {
             base_price_cents: rawProduct.base_price_cents,
             category: rawProduct.category ?? null,
             description: rawProduct.description,
             id: rawProduct.id,
             images: rawProduct.images,
             name: rawProduct.name,
             options: {
               packagings: options.packagings ?? [],
               scents: options.scents ?? [],
               sizes: options.sizes ?? [],
               toppings: options.toppings ?? [],
               waxColors: options.waxColors ?? options.colors ?? [],
             },
           };
           cacheRef.current.set(productId, p);
           setProduct(p);
       } else {
           setProduct(null);
       }
       setLoading(false);
     });


   }, 0);


   return () => {
     ignore = true;
     window.clearTimeout(timerId);
   };
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
           <LoadingState
             label="Đang tải chi tiết sản phẩm..."
             className="h-full w-full border-0 bg-transparent shadow-none"
           />
         </div>
       </Box>
     </Modal>
   );
 }


 return (
   <DetailCardProduct
       key={product.id}
       isAuthenticated={isAuthenticated}
       product={product}
       onClose={handleClose}
   />
 );
}


