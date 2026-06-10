import FormCustom from "../../../components/client/formCustom";
import type { ClientCustomizationOptionsSuccessResponseInterface } from "../../../interface/clientInterface";
import { getCurrentUser } from "../../../lib/action/auth.action";
import { getCustomizationOptionsAction } from "../../../lib/action/product.action";

export default async function TuyChinh() {
  // action-(lấy options tùy chỉnh nến)
  const [result, currentUser] = await Promise.all([
    getCustomizationOptionsAction(),
    getCurrentUser(),
  ]);
  const customizationOptions =
    "success" in result && result.success
      ? (result as ClientCustomizationOptionsSuccessResponseInterface).data
      : undefined;

  return (
    <FormCustom
      isAuthenticated={Boolean(currentUser)}
      options={customizationOptions}
    />
  );
}
