import { notFound } from "next/navigation";
import { getProductDetailsAction } from "@/src/lib/action/product.action";
import { getCurrentUser } from "@/src/lib/action/user.action";
import DetailCardProduct from "@/src/components/client/detailCardProduct";
import type { ClientProductDetailDataInterface } from "@/src/interface/clientInterface";
import type { ProductDetailPageProps } from "@/src/lib/types/client";

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const [result, currentUser] = await Promise.all([
    getProductDetailsAction(id),
    getCurrentUser(),
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

  return (
    <DetailCardProduct
      isAuthenticated={Boolean(currentUser)}
      product={product}
      isModal={false}
    />
  );
}
