"use client";


import { useMemo, useState, useContext, useEffect } from "react";
import CardProduct from "@/src/components/client/cardProduct";
import type {
 ClientProductOptionItemInterface,
 ClientProductItemInterface,
 ClientProductsMetaInterface,
 ClientProductsSuccessResponseInterface,
} from "@/src/interface/clientInterface";
import { getProductsAction } from "@/src/lib/action/product.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type { CollectionSearchParams } from "@/src/lib/types/client";
import { CollectionContext } from "./collectionClient";


type CollectionProductsClientProps = {
 scents: ClientProductOptionItemInterface[];
 initialError?: string;
 initialFilters: {
   scentId: string;
   priceRange: string;
   search: string;
 };
 initialMeta: ClientProductsMetaInterface;
 initialParams: CollectionSearchParams;
 initialProducts: ClientProductItemInterface[];
 pageSize: number;
};


const getAvatarImage = (images: unknown) => {
  let rawUrl = "";
  if (Array.isArray(images)) {
    rawUrl = images.find(
      (image): image is string => typeof image === "string" && image.length > 0,
    ) ?? "";
  } else if (typeof images === "string") {
    rawUrl = images;
  }
  if (rawUrl && rawUrl.includes("cloudinary.com") && rawUrl.includes("/upload/")) {
    return rawUrl.replace("/upload/", "/upload/w_400,c_scale,q_auto,f_auto/");
  }
  return rawUrl;
};





const parsePriceRange = (priceRange: string) => {
 let minPrice: number | undefined;
 let maxPrice: number | undefined;


 if (priceRange) {
   const [min, max] = priceRange.split("-");
   if (min) minPrice = Number(min);
   if (max) maxPrice = Number(max);
 }


 return { maxPrice, minPrice };
};


export default function CollectionProducts({
 scents,
 initialError = "",
 initialFilters,
 initialMeta,
 initialProducts,
 pageSize,
}: CollectionProductsClientProps) {
 const context = useContext(CollectionContext);

 const [localScentId, setLocalScentId] = useState(initialFilters.scentId);
 const [localErrorMessage, setLocalErrorMessage] = useState(initialError);
 const [localIsLoading, setLocalIsLoading] = useState(false);
 const [isPaginating, setIsPaginating] = useState(false);
 const [localMeta, setLocalMeta] = useState(initialMeta);
 const [localPageProducts, setLocalPageProducts] = useState(initialProducts);
 const [localPriceRange, setLocalPriceRange] = useState(initialFilters.priceRange);
 const [search, setSearch] = useState(initialFilters.search);

 const scentId = context ? context.selectedFilter.scentId : localScentId;
 const setScentId = context
   ? (val: string) => context.setSelectedFilter((prev: { scentId: string; priceRange: string; search: string; page: number }) => ({ ...prev, scentId: val }))
   : setLocalScentId;

 const priceRange = context ? context.selectedFilter.priceRange : localPriceRange;
 const setPriceRange = context
   ? (val: string) => context.setSelectedFilter((prev: { scentId: string; priceRange: string; search: string; page: number }) => ({ ...prev, priceRange: val }))
   : setLocalPriceRange;

 const pageProducts = context ? context.products : localPageProducts;
 const isLoading = context ? context.isLoading : localIsLoading;
 const errorMessage = context ? context.error : localErrorMessage;
 const meta = context ? context.meta : localMeta;

 const setPageProducts = setLocalPageProducts;
 const setErrorMessage = context ? context.setError : setLocalErrorMessage;
 const setIsLoading = setLocalIsLoading;
 const setMeta = setLocalMeta;

 const contextSearch = context?.selectedFilter.search;

 useEffect(() => {
   if (contextSearch !== undefined) {
     setTimeout(() => {
       setSearch(contextSearch);
     }, 0);
   }
 }, [contextSearch]);


 const totalPages = Math.max(meta.totalPages ?? 1, 1);
 const currentPage = meta.page ?? 1;


 const updateUrl = (nextParams: CollectionSearchParams) => {
   const query = new URLSearchParams();


   Object.entries(nextParams).forEach(([key, value]) => {
     if (value) query.set(key, value);
   });


   const pathname = window.location.pathname;
   const nextUrl = query.toString()
     ? `${pathname}?${query.toString()}#collection`
     : `${pathname}#collection`;


   window.history.pushState(null, "", nextUrl);
 };


 const loadProducts = async ({
   nextScentId = scentId,
   nextPage = currentPage,
   nextPriceRange = priceRange,
   nextSearch = search,
   isPaginationClick = false,
 }: {
   nextScentId?: string;
   nextPage?: number;
   nextPriceRange?: string;
   nextSearch?: string;
   isPaginationClick?: boolean;
 }) => {
   if (context) {
     const nextParams: CollectionSearchParams = {
       scentId: nextScentId || undefined,
       page: nextPage > 1 ? String(nextPage) : undefined,
       priceRange: nextPriceRange || undefined,
       q: nextSearch.trim() || undefined,
     };
     updateUrl(nextParams);
     return;
   }

   if (isPaginationClick) {
     setIsPaginating(true);
   } else {
     setIsLoading(true);
   }
   const { maxPrice, minPrice } = parsePriceRange(nextPriceRange);


   const result = await getProductsAction({
     scentId: nextScentId ? Number(nextScentId) : undefined,
     limit: pageSize,
     maxPrice,
     minPrice,
     page: nextPage,
     search: nextSearch.trim() || undefined,
   });


   if ("error" in result && result.error) {
     setErrorMessage(getFriendlyResponseError(result.error));
     setPageProducts([]);
     setIsLoading(false);
     setIsPaginating(false);
     return;
   }


   if ("success" in result && result.success) {
     const productResult = result as ClientProductsSuccessResponseInterface;
     const nextProducts = productResult.data.filter(
       (product) => product.is_custom !== true,
     );
     const nextParams: CollectionSearchParams = {
       scentId: nextScentId || undefined,
       page: nextPage > 1 ? String(nextPage) : undefined,
       priceRange: nextPriceRange || undefined,
       q: nextSearch.trim() || undefined,
     };


     setErrorMessage("");
     setMeta(productResult.meta);
     setPageProducts(nextProducts);
     updateUrl(nextParams);
   }


   setIsLoading(false);
   setIsPaginating(false);
 };


 const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
   event.preventDefault();
   void loadProducts({ nextPage: 1 });
 };


 const paginationItems = useMemo(
   () => Array.from({ length: totalPages }, (_, index) => index + 1),
   [totalPages],
 );


 return (
   <>
     <form
       suppressHydrationWarning
       onSubmit={handleSubmitSearch}
       className="collection-filters mt-16 grid gap-4 rounded-lg border border-[#F5F0E8]/8 bg-[#8B363A]/80 p-4 shadow-[0_18px_48px_rgba(44,8,12,0.22)] sm:p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
     >
       <div className="filter-group" suppressHydrationWarning>
         <label
           htmlFor="scent-filter"
           className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
         >
           Hương liệu
         </label>
         <select
           id="scent-filter"
           name="scentId"
           value={scentId}
           onChange={(event) => {
             const nextScentId = event.target.value;
             setScentId(nextScentId);
             void loadProducts({ nextScentId, nextPage: 1 });
           }}
           className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-4 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
         >
           <option value="">Tất cả</option>
           {scents.map((scent) => (
             <option key={scent.id} value={scent.id}>
               {scent.name}
             </option>
           ))}
         </select>
       </div>


       <div className="filter-group" suppressHydrationWarning>
         <label
           htmlFor="price-filter"
           className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
         >
           Giá tiền
         </label>
         <select
           id="price-filter"
           name="priceRange"
           value={priceRange}
           onChange={(event) => {
             const nextPriceRange = event.target.value;
             setPriceRange(nextPriceRange);
             void loadProducts({ nextPage: 1, nextPriceRange });
           }}
           className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-4 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
         >
           <option value="">Tất cả mức giá</option>
           <option value="0-100000">Dưới 100.000đ</option>
           <option value="100000-300000">100.000đ - 300.000đ</option>
           <option value="300000-500000">300.000đ - 500.000đ</option>
           <option value="500000-">Trên 500.000đ</option>
         </select>
       </div>


       <div className="filter-group" suppressHydrationWarning>
         <label
           htmlFor="search-filter"
           className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
         >
           Tìm kiếm
         </label>
         <input
           type="text"
           id="search-filter"
           name="q"
           value={search}
           onChange={(event) => setSearch(event.target.value)}
           className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-4 text-sm text-[#F5F0E8] outline-none transition placeholder:text-[#F5F0E8]/45 focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
           placeholder="Nhập tên sản phẩm..."
         />
       </div>


       <div className="flex gap-2" suppressHydrationWarning>
         <button
           type="submit"
           className="h-12 rounded-md border border-[#F5F0E8]/30 bg-transparent px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
         >
           Lọc
         </button>
         <button
           type="button"
           onClick={() => {
             setScentId("");
             setPriceRange("");
             setSearch("");
             void loadProducts({
               nextScentId: "",
               nextPage: 1,
               nextPriceRange: "",
               nextSearch: "",
             });
           }}
           className="btn-reset-filters flex h-12 items-center justify-center rounded-md border border-[#F5F0E8]/30 px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
         >
           Xóa bộ lọc
         </button>
       </div>
     </form>


     {errorMessage ? (
       <div className="mt-8 rounded-xl border border-[#ffc107] bg-[#fff3cd] p-4 text-sm text-[#856404]">
         {errorMessage}
       </div>
     ) : null}


     <div className="relative">
       {isLoading ? (
         <div className="absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded-full bg-[#F5F0E8] px-4 py-2 text-sm text-[#7A1218] shadow-[0_10px_24px_rgba(44,8,12,0.22)]">
           Đang tải sản phẩm...
         </div>
       ) : null}


       <div
         className={`collection-grid mx-auto mt-10 grid max-w-[1180px] gap-7 sm:grid-cols-2 xl:grid-cols-4 ${isLoading ? "opacity-55" : ""}`}
         id="collection-grid"
       >
         {pageProducts.map((product, index) => (
           <div
             key={product.id}
             data-aos="fade-up"
             data-aos-delay={index * 100}
             suppressHydrationWarning
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
                 "Nến thơm thủ công tinh giản."
               }
             />
           </div>
         ))}
       </div>
     </div>


     {pageProducts.length === 0 && !isLoading && !isPaginating ? (
       <div
         className="no-results mt-10 rounded-2xl border border-dashed border-[#7A1218]/30 bg-[#F5F0E8] p-10 text-center"
         id="no-results"
       >
         <p className="font-serif text-2xl text-[#2C1810]">
           Không tìm thấy sản phẩm phù hợp
         </p>
       </div>
     ) : null}


     {pageProducts.length > 0 ? (
       <div
         className="collection-pagination mt-14 flex flex-wrap items-center justify-center gap-3"
         id="collection-pagination"
       >
         {paginationItems.map((page) => {
           const isActive = page === currentPage;


           return (
             <button
               key={page}
               type="button"
               onClick={() => void loadProducts({ nextPage: page, isPaginationClick: true })}
               disabled={isLoading || isPaginating || isActive}
               className={`flex size-12 items-center justify-center rounded-md border text-sm transition disabled:cursor-default ${isActive
                 ? "border-[#F5F0E8] bg-[#F5F0E8] text-[#7A1218]"
                 : "border-[#F5F0E8]/20 bg-[#8B363A] text-[#F5F0E8] hover:border-[#F5F0E8]/55 hover:bg-[#F5F0E8] hover:text-[#7A1218]"
               }`}
             >
               {page}
             </button>
           );
         })}


         {currentPage < totalPages ? (
           <button
             type="button"
             onClick={() => void loadProducts({ nextPage: currentPage + 1, isPaginationClick: true })}
             disabled={isLoading || isPaginating}
             className="flex h-12 items-center justify-center rounded-md border border-[#F5F0E8]/20 bg-[#8B363A] px-6 text-sm text-[#F5F0E8] transition hover:border-[#F5F0E8]/55 hover:bg-[#F5F0E8] hover:text-[#7A1218] disabled:cursor-not-allowed disabled:opacity-55"
           >
             Sau →
           </button>
         ) : null}
       </div>
     ) : null}
   </>
 );
}
