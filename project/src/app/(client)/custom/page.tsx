import FormCustom from "../../../components/client/formCustom";
import type { ClientCustomizationOptionsSuccessResponseInterface } from "../../../interface/clientInterface";
import { getCustomizationOptionsAction } from "../../../lib/action/product.action";
import { callAction } from "@/src/lib/utils/callAction";


export default async function CustomPage() {
 // action-(lấy options tùy chỉnh nến)
 const result = await callAction(() => getCustomizationOptionsAction(), "Không thể tải tùy chọn tùy chỉnh. Vui lòng thử lại sau.");
 const customizationOptions =
   "success" in result && result.success
     ? (result as ClientCustomizationOptionsSuccessResponseInterface).data
     : undefined;


 return <FormCustom options={customizationOptions} />;
}



