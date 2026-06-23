"use client";

import { Suspense, createContext, useEffect, useState, useRef, useMemo, type Dispatch, type SetStateAction } from "react";
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

  const [allProducts, setAllProducts] = useState<ClientProductItemInterface[]>(initialProducts);
  const [productScentMap, setProductScentMap] = useState<Record<number, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
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
    let active = true;

    const loadAllData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getProductsAction({ limit: 100 });
        if (!active) return;

        if ("error" in result && result.error) {
          setError(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          const productResult = result as ClientProductsSuccessResponseInterface;
          const allProd = productResult.data.filter(
            (product) => product.is_custom !== true,
          );
          setAllProducts(allProd);
        }

        const mappings: Record<number, string[]> = {};
        await Promise.all(
          scents.map(async (scent) => {
            const res = await getProductsAction({ limit: 100, scentId: scent.id });
            if (res && "success" in res && res.success) {
              mappings[scent.id] = res.data.map((p) => p.id);
            }
          })
        );
        if (!active) return;
        setProductScentMap(mappings);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadAllData();
    return () => {
      active = false;
    };
  }, [scents]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (selectedFilter.scentId) {
        const targetScentId = Number(selectedFilter.scentId);
        const mappedProductIds = productScentMap[targetScentId] || [];
        if (!mappedProductIds.includes(product.id)) {
          return false;
        }
      }

      if (selectedFilter.priceRange) {
        const { minPrice, maxPrice } = parsePriceRange(selectedFilter.priceRange);
        if (minPrice !== undefined && product.base_price_cents < minPrice) {
          return false;
        }
        if (maxPrice !== undefined && product.base_price_cents > maxPrice) {
          return false;
        }
      }

      if (selectedFilter.search) {
        const query = selectedFilter.search.toLowerCase().trim();
        if (!product.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, selectedFilter.scentId, selectedFilter.priceRange, selectedFilter.search, productScentMap]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (selectedFilter.page - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, selectedFilter.page, pageSize]);

  const meta = useMemo(() => {
    const total = filteredProducts.length;
    return {
      limit: pageSize,
      page: selectedFilter.page,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    };
  }, [filteredProducts.length, selectedFilter.page, pageSize]);

  const contextValue = useMemo(() => ({
    products: paginatedProducts,
    isLoading,
    error,
    setError,
    selectedFilter,
    setSelectedFilter,
    meta,
    setMeta: (() => {}) as unknown as Dispatch<SetStateAction<ClientProductsMetaInterface>>,
  }), [paginatedProducts, isLoading, error, selectedFilter, meta]);

  return (
    <CollectionContext.Provider value={contextValue}>
      <section
        id="collection"
        className="page-section collection-section fade-section bg-[#6B1218] px-4 py-16 text-[#F5F0E8] sm:px-6 lg:px-12"
      >
        <div className="mx-auto w-full max-w-[1880px]" suppressHydrationWarning>
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
