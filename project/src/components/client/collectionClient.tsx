"use client";

import { Suspense, createContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import CollectionProducts from "@/src/components/client/collectionProducts";
import type {
  ClientProductOptionItemInterface,
  ClientProductItemInterface,
  ClientProductsMetaInterface,
  ClientProductsSuccessResponseInterface,
} from "@/src/interface/clientInterface";
import { getProductsAction } from "@/src/lib/action/product.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useSearchParams } from "next/navigation";

interface CollectionClientProps {
  scents: ClientProductOptionItemInterface[];
  initialError: string;
  initialFilters: {
    scentId: string;
    priceRange: string;
    search: string;
  };
  initialMeta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  initialParams: Record<string, string | undefined>;
  initialProducts: ClientProductItemInterface[];
  pageSize: number;
  isAuthenticated: boolean;
}

export const CollectionContext = createContext<{
  products: ClientProductItemInterface[];
  isLoading: boolean;
  error: string;
  setError: (err: string) => void;
  selectedFilter: { scentId: string; priceRange: string; search: string; page: number };
  setSelectedFilter: Dispatch<SetStateAction<{ scentId: string; priceRange: string; search: string; page: number }>>;
  meta: ClientProductsMetaInterface;
  setMeta: Dispatch<SetStateAction<ClientProductsMetaInterface>>;
} | null>(null);

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

export default function CollectionClient({
  scents,
  initialError,
  initialFilters,
  initialMeta,
  initialParams,
  initialProducts,
  pageSize,
  isAuthenticated,
}: CollectionClientProps) {
  return (
    <Suspense fallback={null}>
      <CollectionClientInner
        scents={scents}
        initialError={initialError}
        initialFilters={initialFilters}
        initialMeta={initialMeta}
        initialParams={initialParams}
        initialProducts={initialProducts}
        pageSize={pageSize}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
}

function CollectionClientInner({
  scents,
  initialError,
  initialFilters,
  initialMeta,
  initialParams,
  initialProducts,
  pageSize,
  // isAuthenticated parameter is ignored as modal detail is removed
}: CollectionClientProps) {
  const searchParams = useSearchParams();
  const scentId = searchParams.get("scentId") || "";
  const priceRange = searchParams.get("priceRange") || "";
  const search = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || "1");

  const [products, setProducts] = useState<ClientProductItemInterface[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [meta, setMeta] = useState<ClientProductsMetaInterface>(initialMeta);
  const [selectedFilter, setSelectedFilter] = useState({
    scentId,
    priceRange,
    search,
    page,
  });

  useEffect(() => {
    setTimeout(() => {
      setSelectedFilter({ scentId, priceRange, search, page });
    }, 0);
  }, [scentId, priceRange, search, page]);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const { maxPrice, minPrice } = parsePriceRange(selectedFilter.priceRange);
        const result = await getProductsAction({
          scentId: selectedFilter.scentId ? Number(selectedFilter.scentId) : undefined,
          limit: pageSize,
          maxPrice,
          minPrice,
          page: selectedFilter.page,
          search: selectedFilter.search.trim() || undefined,
        });

        if (cancelled) return;

        if ("error" in result && result.error) {
          setError(getFriendlyResponseError(result.error));
          setProducts([]);
        } else if ("success" in result && result.success) {
          const productResult = result as ClientProductsSuccessResponseInterface;
          const nextProducts = productResult.data.filter(
            (product) => product.is_custom !== true,
          );
          setProducts(nextProducts);
          setMeta(productResult.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedFilter, pageSize]);

  return (
    <CollectionContext.Provider
      value={{
        products,
        isLoading,
        error,
        setError,
        selectedFilter,
        setSelectedFilter,
        meta,
        setMeta,
      }}
    >
      <section
        id="collection"
        className="page-section collection-section fade-section bg-[#6B1218] px-4 py-16 text-[#F5F0E8] sm:px-6 lg:px-12"
      >
        <div className="mx-auto w-full max-w-[1880px]">
          <div
            className="collection-header mx-auto max-w-2xl text-center"
            suppressHydrationWarning
          >
            <h2 className="font-serif text-[2.4rem] font-light leading-tight text-[#F5F0E8] sm:text-[3rem]">
              Bộ Sưu Tập
            </h2>
            <p className="mt-3 text-[0.95rem] leading-7 text-[#F5F0E8]/72">
              Khám phá những sáng tạo nến thơm được chọn lọc kỹ lưỡng
            </p>
          </div>

          <CollectionProducts
            scents={scents}
            initialError={initialError}
            initialFilters={initialFilters}
            initialMeta={initialMeta}
            initialParams={initialParams}
            initialProducts={initialProducts}
            pageSize={pageSize}
          />


        </div>
      </section>
    </CollectionContext.Provider>
  );
}
