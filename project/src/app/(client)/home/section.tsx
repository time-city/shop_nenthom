import HomeClient from "@/src/components/client/pages/homeClient";

export default function Page({ initialCategories }: { initialCategories?: any }) {
  return <HomeClient initialCategories={initialCategories} />;
}

