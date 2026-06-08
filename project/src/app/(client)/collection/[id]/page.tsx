import DetailCardProduct, {
  type ProductDetail,
} from "../../../../components/client/detailCardProduct";
import { getProductDetailsAction } from "../../../../lib/action/product.action";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductDetailData = {
  options?: {
    colors?: NonNullable<ProductDetail["options"]>["waxColors"];
    packagings?: NonNullable<ProductDetail["options"]>["packagings"];
    scents?: NonNullable<ProductDetail["options"]>["scents"];
    sizes?: NonNullable<ProductDetail["options"]>["sizes"];
    toppings?: NonNullable<ProductDetail["options"]>["toppings"];
    waxColors?: NonNullable<ProductDetail["options"]>["waxColors"];
  };
  product?: Partial<ProductDetail>;
  [key: string]: unknown;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const result = await getProductDetailsAction(id);

  if (!("success" in result) || !result.success) {
    return (
      <main className="min-h-screen bg-[#7A1218] px-4 py-32 text-[#F5F0E8]">
        <div className="mx-auto max-w-xl rounded-2xl bg-[#F8F0E4] p-8 text-center text-[#2C1810]">
          <h1 className="font-serif text-3xl text-[#6B1218]">
            Không tìm thấy sản phẩm
          </h1>
          <p className="mt-3 text-sm text-[#6B4C35]">
            {"error" in result ? result.error : "Sản phẩm không tồn tại."}
          </p>
        </div>
      </main>
    );
  }

  const detailData = result.data as ProductDetailData;
  const rawProduct = (detailData.product ?? detailData) as Partial<ProductDetail>;
  const rawOptions = (detailData.options ??
    rawProduct.options ??
    {}) as NonNullable<ProductDetailData["options"]>;
  const product: ProductDetail = {
    base_price_cents: rawProduct.base_price_cents ?? 0,
    category: rawProduct.category ?? null,
    description: rawProduct.description ?? null,
    id: rawProduct.id ?? id,
    images: rawProduct.images ?? [],
    name: rawProduct.name ?? "Sản phẩm",
    options: {
      packagings: rawOptions.packagings ?? [],
      scents: rawOptions.scents ?? [],
      sizes: rawOptions.sizes ?? [],
      toppings: rawOptions.toppings ?? [],
      waxColors: rawOptions.waxColors ?? rawOptions.colors ?? [],
    },
  };

  return (
    <main className="min-h-screen bg-[#7A1218]">
      <DetailCardProduct product={product} />
    </main>
  );
}
