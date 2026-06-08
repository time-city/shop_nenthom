import Link from "next/link";
import { Suspense } from "react";
import CardProduct from "../../../components/client/cardProduct";
import DetailCardModal from "../../../components/client/detailCardModal";
import { getProductsAction } from "../../../lib/action/product.action";

type SearchParams = {
  page?: string;
  price?: string;
  productId?: string;
  q?: string;
  scent?: string;
};

type ProductItem = {
  base_price_cents: number;
  category?: {
    description: string | null;
    id: number;
    name: string;
  } | null;
  description: string | null;
  id: string;
  images: unknown;
  name: string;
};

type ProductListData =
  | ProductItem[]
  | {
      items?: ProductItem[];
      pagination?: {
        limit: number;
        page: number;
        totalItems: number;
        totalPages: number;
      };
    };

type CollectionPageProps = {
  searchParams?: Promise<SearchParams>;
};

const scentOptions = [
  "Vanilla",
  "Floral",
  "Woody",
  "Fresh",
  "Citrus",
  "Sweet",
  "Spicy",
  "Oriental",
];

const priceOptions = [
  { label: "Dưới 300K", value: "under-300" },
  { label: "300K - 500K", value: "300-500" },
  { label: "500K - 800K", value: "500-800" },
  { label: "Trên 800K", value: "over-800" },
];

const pageSize = 10;

const candleColors = [
  "#C8DDC4",
  "#E7B4D4",
  "#E4A9CB",
  "#D29A61",
  "#C88F58",
  "#F1DEC5",
];

const getCandleColor = (index: number) =>
  candleColors[index % candleColors.length];

const matchesPrice = (price: number, filter?: string) => {
  if (!filter) return true;

  if (filter === "under-300") return price < 300000;
  if (filter === "300-500") return price >= 300000 && price <= 500000;
  if (filter === "500-800") return price >= 500000 && price <= 800000;
  if (filter === "over-800") return price > 800000;

  return true;
};

const matchesScent = (product: ProductItem, scent?: string) => {
  if (!scent) return true;

  const searchableText = [
    product.name,
    product.description,
    product.category?.name,
    product.category?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(scent.toLowerCase());
};

const buildCollectionHref = (
  params: SearchParams,
  overrides: Partial<SearchParams>,
) => {
  const nextParams = new URLSearchParams();
  const merged = { ...params, ...overrides };

  Object.entries(merged).forEach(([key, value]) => {
    if (value) nextParams.set(key, value);
  });

  const query = nextParams.toString();
  return query ? `/collection?${query}` : "/collection";
};

export default async function BoSuuTap({
  searchParams,
}: CollectionPageProps = {}) {
  const params = (await searchParams) ?? {};
  const activePage = Math.max(Number(params.page ?? 1), 1);
  const activePrice = params.price ?? "";
  const activeSearch = params.q?.trim() ?? "";
  const activeScent = params.scent ?? "";

  const result = await getProductsAction({
    limit: 100,
    page: 1,
    search: activeSearch || undefined,
  });

  const hasProducts = "success" in result && result.success;
  const errorMessage = "error" in result ? result.error : "";
  const productPayload = hasProducts
    ? (result.data as ProductListData | undefined)
    : undefined;
  const allProducts = Array.isArray(productPayload)
    ? productPayload
    : (productPayload?.items ?? []);

  const filteredProducts = allProducts.filter(
    (product) =>
      matchesPrice(product.base_price_cents, activePrice) &&
      matchesScent(product, activeScent),
  );

  const totalPages = Math.max(Math.ceil(filteredProducts.length / pageSize), 1);
  const currentPage = Math.min(activePage, totalPages);
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <section
      id="collection"
      className="page-section collection-section fade-section bg-[#7A1218] px-4 py-16 text-[#F5F0E8] sm:px-6 lg:px-12"
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
          action="/collection"
          className="collection-filters mt-16 grid gap-4 rounded-lg border border-[#F5F0E8]/8 bg-[#8B363A]/80 p-4 shadow-[0_18px_48px_rgba(44,8,12,0.22)] sm:p-5 md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-end"
        >
          <div className="filter-group">
            <label
              htmlFor="scent-filter"
              className="mb-3 block text-[0.7rem] uppercase tracking-[0.14em] text-[#F5F0E8]"
            >
              Hương liệu
            </label>
            <select
              id="scent-filter"
              name="scent"
              defaultValue={activeScent}
              className="filter-select h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-3 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
            >
              <option value="">Tất cả</option>
              {scentOptions.map((scent) => (
                <option key={scent} value={scent}>
                  {scent}
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
              name="price"
              defaultValue={activePrice}
              className="filter-select h-12 w-full rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-3 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10"
            >
              <option value="">Tất cả</option>
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
            <button
              type="submit"
              className="h-12 rounded-md border border-[#F5F0E8]/30 bg-transparent px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
            >
              Lọc
            </button>
            <Link
              href="/collection"
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
              candleColor={getCandleColor(index)}
              href={buildCollectionHref(params, { productId: product.id })}
              id={product.id}
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

        {filteredProducts.length === 0 ? (
          <div
            className="no-results mt-10 rounded-2xl border border-dashed border-[#7A1218]/30 bg-[#F5F0E8] p-10 text-center"
            id="no-results"
          >
            <p className="font-serif text-2xl text-[#2C1810]">
              Không tìm thấy sản phẩm phù hợp
            </p>
          </div>
        ) : null}

        {filteredProducts.length > 0 ? (
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
                  href={buildCollectionHref(params, { page })}
                  className={`flex size-12 items-center justify-center rounded-md border text-sm transition ${
                    isActive
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
                })}
                className="flex h-12 items-center justify-center rounded-md border border-[#F5F0E8]/20 bg-[#8B363A] px-6 text-sm text-[#F5F0E8] transition hover:border-[#F5F0E8]/55 hover:bg-[#F5F0E8] hover:text-[#7A1218]"
              >
                Sau →
              </Link>
            ) : null}
          </div>
        ) : null}
        
        <Suspense fallback={null}>
          <DetailCardModal />
        </Suspense>
      </div>
    </section>
  );
}
