"use client";


import { usePathname, useRouter } from "next/navigation";


export default function ClearCollectionFiltersButton() {
 const pathname = usePathname();
 const router = useRouter();


 const handleClearFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
   const form = event.currentTarget.form;


   if (form) {
     const categoryFilter = form.elements.namedItem("categoryId");
     const priceFilter = form.elements.namedItem("priceRange");
     const searchFilter = form.elements.namedItem("q");


     if (categoryFilter instanceof HTMLSelectElement) categoryFilter.value = "";
     if (priceFilter instanceof HTMLSelectElement) priceFilter.value = "";
     if (searchFilter instanceof HTMLInputElement) searchFilter.value = "";
   }


   router.replace(`${pathname}#collection`);
 };


 return (
   <button
     type="button"
     onClick={handleClearFilters}
     className="btn-reset-filters flex h-12 items-center justify-center rounded-md border border-[#F5F0E8]/30 px-5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
   >
     Xóa bộ lọc
   </button>
 );
}



