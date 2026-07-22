"use client";


import { useMemo, useState, useContext, useEffect } from "react";
import CardProduct from "@/src/components/client/product/cardProduct";
import type {
  ClientProductOptionItemInterface,
  ClientProductItemInterface,
  ClientProductsMetaInterface,
  ClientProductsSuccessResponseInterface,
} from "@/src/interface/clientInterface";
import { getProductsAction } from "@/src/lib/action/product.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type { CollectionSearchParams } from "@/src/lib/types/client";
import { CollectionContext } from "@/src/components/client/collection/collectionClient";
import Spinner from "@/src/components/ui/Spinner";
import { callAction } from "@/src/lib/utils/callAction";
import CustomDropdown from "@/src/components/client/common/customDropdown";


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
  pageSize = 8,
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
    ? (val: string) => context.setSelectedFilter((prev: { scentId: string; priceRange: string; search: string; page: number }) => ({ ...prev, scentId: val, page: 1 }))
    : setLocalScentId;

  const priceRange = context ? context.selectedFilter.priceRange : localPriceRange;
  const setPriceRange = context
    ? (val: string) => context.setSelectedFilter((prev: { scentId: string; priceRange: string; search: string; page: number }) => ({ ...prev, priceRange: val, page: 1 }))
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


  // Debounce search update
  useEffect(() => {
    if (!context) return;
    if (search === context.selectedFilter.search) return;

    const timer = setTimeout(() => {
      context.setSelectedFilter((prev) => ({
        ...prev,
        search: search,
        page: 1,
      }));

      const nextParams: CollectionSearchParams = {
        scentId: scentId || undefined,
        page: undefined,
        priceRange: priceRange || undefined,
        q: search.trim() || undefined,
      };
      updateUrl(nextParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, context, scentId, priceRange]);


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
      context.setSelectedFilter({
        scentId: nextScentId,
        priceRange: nextPriceRange,
        search: nextSearch,
        page: nextPage,
      });

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


    const result = await callAction(() => getProductsAction({
      scentId: nextScentId ? Number(nextScentId) : undefined,
      limit: pageSize,
      maxPrice,
      minPrice,
      page: nextPage,
      search: nextSearch.trim() || undefined,
    }), "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");


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

  const handleResetFilters = () => {
    setScentId("");
    setPriceRange("");
    setSearch("");
    if (context) {
      context.setSelectedFilter({
        scentId: "",
        priceRange: "",
        search: "",
        page: 1,
      });
      updateUrl({});
    } else {
      void loadProducts({
        nextScentId: "",
        nextPage: 1,
        nextPriceRange: "",
        nextSearch: "",
      });
    }
  };

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (context) {
      context.setSelectedFilter((prev) => ({
        ...prev,
        search: search,
        page: 1,
      }));
      const nextParams: CollectionSearchParams = {
        scentId: scentId || undefined,
        page: undefined,
        priceRange: priceRange || undefined,
        q: search.trim() || undefined,
      };
      updateUrl(nextParams);
    } else {
      void loadProducts({ nextPage: 1 });
    }
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
        className="collection-filters mx-auto max-w-[1180px] mt-16 grid gap-4 rounded-lg border border-[#F5F0E8]/8 bg-[#3a080f] p-4 shadow-[0_18px_48px_rgba(44,8,12,0.22)] sm:p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
      >
        <div className="filter-group" suppressHydrationWarning>
          <label
            htmlFor="scent-filter"
            className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
          >
            Hương liệu
          </label>
          <CustomDropdown
            id="scent-filter"
            value={scentId}
            options={[
              { value: "", label: "Tất cả" },
              ...scents.map((scent) => ({ value: String(scent.id), label: scent.name })),
            ]}
            onChange={(nextScentId) => {
              setScentId(nextScentId);
              void loadProducts({ nextScentId, nextPage: 1 });
            }}
            placeholder="Tất cả"
          />
        </div>


        <div className="filter-group" suppressHydrationWarning>
          <label
            htmlFor="price-filter"
            className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
          >
            Giá tiền
          </label>
          <CustomDropdown
            id="price-filter"
            value={priceRange}
            options={[
              { value: "", label: "Tất cả mức giá" },
              { value: "0-100000", label: "Dưới 100.000đ" },
              { value: "100000-300000", label: "100.000đ - 300.000đ" },
              { value: "300000-500000", label: "300.000đ - 500.000đ" },
              { value: "500000-", label: "Trên 500.000đ" },
            ]}
            onChange={(nextPriceRange) => {
              setPriceRange(nextPriceRange);
              void loadProducts({ nextPage: 1, nextPriceRange });
            }}
            placeholder="Tất cả mức giá"
          />
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
            className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-5 py-3 text-sm text-[#F5F0E8] outline-none transition placeholder:text-[#F5F0E8]/45 focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
            placeholder="Nhập tên sản phẩm..."
          />
        </div>


        <div className="flex gap-2 w-full sm:w-auto" suppressHydrationWarning>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-reset-filters flex h-12 w-full sm:w-auto items-center justify-center rounded-md border border-[#F5F0E8]/30 px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition-all duration-300 hover:bg-[#F5F0E8] hover:text-[#7A1218]"
          >
            Mặc định
          </button>
        </div>
      </form>


      {errorMessage ? (
        <div className="mt-8 rounded-xl border border-[#ffc107] bg-[#fff3cd] p-4 text-sm text-[#856404]">
          {errorMessage}
        </div>
      ) : null}


      <div className="relative">
        <style dangerouslySetInnerHTML={{
          __html: `
         @keyframes slideUpFade {
           0% { opacity: 0; transform: translateY(40px); }
           100% { opacity: 1; transform: translateY(0); }
         }
         .animate-slide-up-fade {
           animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           opacity: 0;
         }
       `}} />
        <div
          className="collection-grid mx-auto mt-10 flex max-w-[1180px] snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 sm:grid sm:grid-cols-2 sm:gap-7 sm:overflow-x-visible sm:px-0 xl:grid-cols-4 transition-opacity duration-300 scrollbar-hide"
          id="collection-grid"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="w-[75vw] shrink-0 snap-center sm:w-auto flex flex-col gap-4 rounded-[2rem] bg-black/10 backdrop-blur-xl border border-[#F5F0E8]/5 p-4 shadow-lg animate-pulse">
                <div className="aspect-[4/5] w-full rounded-2xl bg-[#F5F0E8]/10"></div>
                <div className="px-2 pb-2">
                  <div className="h-5 w-3/4 bg-[#F5F0E8]/10 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-[#F5F0E8]/10 rounded mb-4"></div>
                  <div className="h-10 w-full bg-[#F5F0E8]/10 rounded-xl"></div>
                </div>
              </div>
            ))
          ) : (
            pageProducts.map((product, index) => (
              <div
                key={`${product.id}-${currentPage}`}
                className="w-[75vw] shrink-0 snap-center sm:w-auto animate-slide-up-fade"
                style={{ animationDelay: `${index * 150}ms` }}
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
            ))
          )}
        </div>
      </div>


      {pageProducts.length === 0 && !isLoading && !isPaginating ? (
        <div
          className="no-results mx-auto mt-10 max-w-[1180px] rounded-xl border border-[#F5F0E8]/8 bg-[#8B363A]/80 py-20 px-4 text-center shadow-[0_18px_48px_rgba(44,8,12,0.22)] backdrop-blur-md"
          id="no-results"
        >
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#F5F0E8]/10">
            <svg
              className="size-8 text-[#F5F0E8]/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="font-serif text-2xl text-[#F5F0E8]">
            Không tìm thấy sản phẩm phù hợp
          </p>
          <p className="mt-3 text-sm text-[#F5F0E8]/60">
            Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md border border-[#F5F0E8]/30 bg-transparent px-6 text-sm font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition-all duration-300 hover:bg-[#F5F0E8] hover:text-[#7A1218]"
          >
            Mặc định
          </button>
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
