import Link from "next/link";
import { Suspense } from "react";
import CardProduct from "../../../components/client/cardProduct";
import DetailCardModal from "../../../components/client/detailCardModal";
import type {
  ClientProductsSuccessResponseInterface,
} from "../../../interface/clientInterface";
import { getCurrentUser } from "../../../lib/action/auth.action";
import { getCategoriesAction } from "../../../lib/action/category.action";
import { getProductsAction } from "../../../lib/action/product.action";
import type {
  CollectionPageProps,
  CollectionSearchParams,
} from "../../../lib/types/client";

const pageSize = 10;

const buildCollectionHref = (
  params: CollectionSearchParams,
  overrides: Partial<CollectionSearchParams>,
) => {
  const nextParams = new URLSearchParams();
  const merged = { ...params, ...overrides };

  Object.entries(merged).forEach(([key, value]) => {
    if (value) nextParams.set(key, value);
  });

  const query = nextParams.toString();
  return query ? `?${query}` : ".";
};

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
  const pageProducts = productResult?.data ?? [];
  const totalPages = Math.max(productResult?.meta.totalPages ?? 1, 1);
  const currentPage = productResult?.meta.page ?? activePage;

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

        <form
          action=""
          method="get"
          className="collection-filters mt-16 grid gap-4 rounded-lg border border-[#F5F0E8]/8 bg-[#8B363A]/80 p-4 shadow-[0_18px_48px_rgba(44,8,12,0.22)] sm:p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
        >
          <div className="filter-group">
            <label
              htmlFor="category-filter"
              className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
            >
              Hương liệu
            </label>
            <select
              id="category-filter"
              name="categoryId"
              defaultValue={Number.isFinite(activeCategoryId) ? activeCategoryId : ""}
              className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-4 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
            >
              <option value="">Tất cả</option>
              {categories &&
                categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label
              htmlFor="price-filter"
              className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
            >
              Giá tiền
            </label>
            <select
              id="price-filter"
              name="priceRange"
              defaultValue={priceRange}
              className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-4 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
            >
              <option value="">Tất cả mức giá</option>
              <option value="0-100000">Dưới 100.000đ</option>
              <option value="100000-300000">100.000đ - 300.000đ</option>
              <option value="300000-500000">300.000đ - 500.000đ</option>
              <option value="500000-">Trên 500.000đ</option>
            </select>
          </div>

          <div className="filter-group">
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
              defaultValue={activeSearch}
              className="filter-input h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-4 text-sm text-[#F5F0E8] outline-none transition placeholder:text-[#F5F0E8]/45 focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
              placeholder="Nhập tên sản phẩm..."
            />
          </div>

          <div className="flex gap-2">
            {/* <button
              type="submit"
              className="h-12 rounded-md border border-[#F5F0E8]/30 bg-transparent px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
            >
              Lọc
            </button> */}
            <Link
              href="?"
              className="btn-reset-filters flex h-12 items-center justify-center rounded-md border border-[#F5F0E8]/30 px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
            >
              Xóa bộ lọc
            </Link>
          </div>
        </form>

        {errorMessage ? (
          <div className="mt-8 rounded-xl border border-[#ffc107] bg-[#fff3cd] p-4 text-sm text-[#856404]">
            {errorMessage}
          </div>
        ) : null}

        <div
          className="collection-grid mx-auto mt-10 grid max-w-[1220px] gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          id="collection-grid"
        >
          {pageProducts.map((product, index) => (
            <CardProduct
              key={product.id}
              href={buildCollectionHref(params, { productId: product.id })}
              id={product.id}
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
          ))}
        </div>

        {pageProducts.length === 0 ? (
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
            {Array.from({ length: totalPages }, (_, index) => {
              const page = String(index + 1);
              const isActive = page === String(currentPage);

              return (
                <Link
                  key={page}
                  href={buildCollectionHref(params, {
                    page,
                    productId: undefined,
                  })}
                  className={`flex size-12 items-center justify-center rounded-md border text-sm transition ${isActive
                      ? "border-[#F5F0E8] bg-[#F5F0E8] text-[#7A1218]"
                      : "border-[#F5F0E8]/20 bg-[#8B363A] text-[#F5F0E8] hover:border-[#F5F0E8]/55 hover:bg-[#F5F0E8] hover:text-[#7A1218]"
                    }`}
                >
                  {page}
                </Link>
              );
            })}

            {currentPage < totalPages ? (
              <Link
                href={buildCollectionHref(params, {
                  page: String(currentPage + 1),
                  productId: undefined,
                })}
                className="flex h-12 items-center justify-center rounded-md border border-[#F5F0E8]/20 bg-[#8B363A] px-6 text-sm text-[#F5F0E8] transition hover:border-[#F5F0E8]/55 hover:bg-[#F5F0E8] hover:text-[#7A1218]"
              >
                Sau →
              </Link>
            ) : null}
          </div>
        ) : null}

        <Suspense fallback={null}>
          <DetailCardModal isAuthenticated={Boolean(currentUser)} />
        </Suspense>
      </div>
    </section>
  );
}
