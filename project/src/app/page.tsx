import LandingLayout from "@/src/components/client/layout/landingLayout";
import { getCategoriesAction } from "@/src/lib/action/category.action";
import { getCurrentUser } from "../lib/action/user.action";
import { redirect } from "next/navigation";
import type { CollectionPageProps } from "../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";

export default async function Home({ searchParams }: CollectionPageProps) {
  // action-(check role trang vào web)
  const currentUser = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const categoriesResponse = await callAction(() => getCategoriesAction(), "Không thể tải danh mục. Vui lòng thử lại sau.");
  const initialCategories = categoriesResponse && "success" in categoriesResponse && categoriesResponse.success ? categoriesResponse : undefined;

  return <LandingLayout searchParams={searchParams} initialCategories={initialCategories as any} />;
}
