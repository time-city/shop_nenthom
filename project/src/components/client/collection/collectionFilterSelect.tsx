"use client";


import type { SelectHTMLAttributes } from "react";


type CollectionFilterSelectProps = SelectHTMLAttributes<HTMLSelectElement>;


export default function CollectionFilterSelect({
 children,
 onChange,
 ...props
}: CollectionFilterSelectProps) {
 return (
   <select
     {...props}
     onChange={(event) => {
       onChange?.(event);
       event.currentTarget.form?.requestSubmit();
     }}
   >
     {children}
   </select>
 );
}



