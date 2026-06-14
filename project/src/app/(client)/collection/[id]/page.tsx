import { Suspense } from "react";
import CollectionProducts from "@/src/components/client/collectionProducts";
import DetailCardModal from "@/src/components/client/detailCardModal";
import type {
ClientProductsSuccessResponseInterface,
} from "@/src/interface/clientInterface";
import { getCurrentUser } from "@/src/lib/action/auth.action";
import { getCategoriesAction } from "@/src/lib/action/category.action";
import { getProductsAction } from "@/src/lib/action/product.action";
import type {
CollectionPageProps,
} from "@/src/lib/types/client";


const pageSize = 4;

//get product action
export default async function CollectionPage({
searchParams,
}: CollectionPageProps = {}) {
const params = (await searchParams) ?? {};
const activePage = Math.max(Number(params.page ?? 1), 1);
const activeCategoryId = Number(params.categoryId);
const activeSearch = params.q?.trim() ?? "";
const priceRange = params.priceRange?.trim() ?? "";




let minPrice: number | undefined;
let maxPrice: number | undefined;
if (priceRange) {
  const [min, max] = priceRange.split("-");
  if (min) minPrice = Number(min);
  if (max) maxPrice = Number(max);
}




const [result, currentUser, categoryResult] = await Promise.all([
  getProductsAction({
    limit: pageSize,
    page: activePage,
    categoryId: Number.isFinite(activeCategoryId)
      ? activeCategoryId
      : undefined,
    search: activeSearch || undefined,
    minPrice,
    maxPrice,
  }),
  getCurrentUser(),
  getCategoriesAction(),
]);

const categories =
  categoryResult && "success" in categoryResult && categoryResult.success
    ? categoryResult.categories
    : [];

const errorMessage = "error" in result ? result.error : "";
const productResult =
  "success" in result && result.success
    ? (result as ClientProductsSuccessResponseInterface)
    : null;
const pageProducts = (productResult?.data ?? []).filter((product) => product.is_custom !== true);
const meta = productResult?.meta ?? {
  limit: pageSize,
  page: activePage,
  total: 0,
  totalPages: 1,
};




return (
  <section
    id="collection"
    className="page-section collection-section fade-section bg-[#6B1218] px-4 py-16 text-[#F5F0E8] sm:px-6 lg:px-12"
  >
    <div className="mx-auto w-full max-w-[1880px]">
      <div className="collection-header mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-[2.4rem] font-light leading-tight text-[#F5F0E8] sm:text-[3rem]">
          Bộ Sưu Tập
        </h2>
        <p className="mt-3 text-[0.95rem] leading-7 text-[#F5F0E8]/72">
          Khám phá những sáng tạo nến thơm được chọn lọc kỹ lưỡng
        </p>
      </div>




      <CollectionProducts
        categories={categories}
        initialError={errorMessage}
        initialFilters={{
          categoryId: Number.isFinite(activeCategoryId) ? String(activeCategoryId) : "",
          priceRange,
          search: activeSearch,
        }}
        initialMeta={meta}
        initialParams={params}
        initialProducts={pageProducts}
        pageSize={pageSize}
      />

      <Suspense fallback={null}>
        <DetailCardModal isAuthenticated={Boolean(currentUser)} />
      </Suspense>
    </div>
  </section>
);
}



