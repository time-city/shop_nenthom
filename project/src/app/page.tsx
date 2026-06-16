import LandingLayout from "@/src/components/client/landingLayout";
import { getCurrentUser } from "../lib/action/user.action";
import { redirect } from "next/navigation";
import type { CollectionPageProps } from "../lib/types/client";

export default async function Home({ searchParams }: CollectionPageProps = {}) {
  // action-(check role trang vào web)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <LandingLayout searchParams={searchParams} />;
}

