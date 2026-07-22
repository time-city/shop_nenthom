import { getMyOrderDetailAction } from "./src/lib/action/order.action";
async function run() {
  const res = await getMyOrderDetailAction("DH-MRBOPLEB-4283");
  console.log(res);
}
run();
