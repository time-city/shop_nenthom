import { notFound } from "next/navigation";
import { getProductDetailsAction } from "@/src/lib/action/product.action";
import { getCurrentUser } from "@/src/lib/action/user.action";
import DetailCardProduct from "@/src/components/client/product/detailCardProduct";
import type { ClientProductDetailDataInterface, ClientProductsSuccessResponseInterface } from "@/src/interface/clientInterface";
import type { ProductDetailPageProps } from "@/src/lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";
import { getProductsAction } from "@/src/lib/action/product.action";
import { getReviewsByProductAction } from "@/src/lib/action/review.action";

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const [result, currentUser] = await Promise.all([
    callAction(() => getProductDetailsAction(id), "Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau."),
    callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau."),
  ]);

  if (!result || !("success" in result) || !result.success || !result.data) {
    notFound();
  }

  const detailData = result.data as ClientProductDetailDataInterface;
  const { options, product: rawProduct } = detailData;

  const product = {
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

  let similarProducts: any[] = [];
  if (product.category?.id) {
    const similarResult = await callAction(() => getProductsAction({ categoryId: product.category!.id, limit: 5 }), "Không thể tải sản phẩm tương tự.");
    if (similarResult && "success" in similarResult && similarResult.success) {
      const data = (similarResult as ClientProductsSuccessResponseInterface).data;
      similarProducts = data.filter(p => p.id !== product.id).slice(0, 4);
    }
  }

  let initialReviews: any = { items: [], total: 0 };
  const reviewsResult = await callAction(() => getReviewsByProductAction({ productId: product.id, limit: 50, page: 1, status: 'published' }), "Không thể tải đánh giá sản phẩm.");
  if (reviewsResult && "success" in reviewsResult && reviewsResult.success) {
    initialReviews = reviewsResult.data;
  }

  return (
    <DetailCardProduct
      isAuthenticated={Boolean(currentUser)}
      product={product}
      isModal={false}
      similarProducts={similarProducts}
      initialReviews={initialReviews}
    />
  );
}
