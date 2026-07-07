import FormCustom from "@/src/components/client/common/formCustom";
import type { ClientCustomizationOptionsSuccessResponseInterface } from "../../../interface/clientInterface";
import { getCustomizationOptionsAction } from "../../../lib/action/product.action";


export default async function CustomPage() {
 // action-(lấy options tùy chỉnh nến)
 const result = await getCustomizationOptionsAction();
 const customizationOptions =
   "success" in result && result.success
     ? (result as ClientCustomizationOptionsSuccessResponseInterface).data
     : undefined;


 return <FormCustom options={customizationOptions} />;
}



