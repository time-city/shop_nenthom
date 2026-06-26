import CollectionClient from "@/src/components/client/collectionClient";
import type { ClientProductsSuccessResponseInterface } from "@/src/interface/clientInterface";
import { getCurrentUser } from "@/src/lib/action/user.action";
import { getProductsAction, getScentsAction } from "@/src/lib/action/product.action";
import type { CollectionPageProps } from "@/src/lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";

const pageSize = 4;

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const params = (await searchParams) ?? {};
  const activePage = Math.max(Number(params.page ?? 1), 1);
  const activeScentId = Number(params.scentId);
  const activeSearch = params.q?.trim() ?? "";
  const priceRange = params.priceRange?.trim() ?? "";

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (priceRange) {
    const [min, max] = priceRange.split("-");
    if (min) minPrice = Number(min);
    if (max) maxPrice = Number(max);
  }

  const [result, currentUser, scentResult] = await Promise.all([
    callAction(() => getProductsAction({
      limit: pageSize,
      page: activePage,
      scentId: Number.isFinite(activeScentId)
        ? activeScentId
        : undefined,
      search: activeSearch || undefined,
      minPrice,
      maxPrice,
    }), "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."),
    callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau."),
    callAction(() => getScentsAction(), "Không thể tải danh sách hương. Vui lòng thử lại sau."),
  ]);

  const scents =
    scentResult && "success" in scentResult && scentResult.success
      ? scentResult.data
      : [];

  const errorMessage = ("error" in result ? result.error : "") || "";
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
    <CollectionClient
      scents={scents}
      initialError={errorMessage}
      initialFilters={{
        scentId: Number.isFinite(activeScentId) ? String(activeScentId) : "",
        priceRange,
        search: activeSearch,
      }}
      initialMeta={meta}
      initialParams={params}
      initialProducts={pageProducts}
      pageSize={pageSize}
      isAuthenticated={Boolean(currentUser)}
    />
  );
}



