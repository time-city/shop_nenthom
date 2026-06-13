import FormCustom from "../../../components/client/formCustom";
import type {
  ClientCustomCandleProductSuccessResponseInterface,
  ClientCustomizationOptionsSuccessResponseInterface,
} from "../../../interface/clientInterface";
import { getCurrentUser } from "../../../lib/action/auth.action";
import {
  getCustomCandleProductAction,
  getCustomizationOptionsAction,
} from "../../../lib/action/product.action";

export default async function CustomPage() {
  // action-(lấy options tùy chỉnh nến)
  const [result, currentUser, customProductResult] = await Promise.all([
    getCustomizationOptionsAction(),
    getCurrentUser(),
    getCustomCandleProductAction(),
  ]);
  const customizationOptions =
    "success" in result && result.success
      ? (result as ClientCustomizationOptionsSuccessResponseInterface).data
      : undefined;
  const customProduct =
    "success" in customProductResult && customProductResult.success
      ? (customProductResult as ClientCustomCandleProductSuccessResponseInterface).data
      : undefined;

  return (
    <FormCustom
      basePrice={customProduct?.base_price_cents}
      baseProductId={customProduct?.id}
      isAuthenticated={Boolean(currentUser)}
      options={customizationOptions}
    />
  );
}
