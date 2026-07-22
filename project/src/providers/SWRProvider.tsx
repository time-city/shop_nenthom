"use client";

import { SWRConfig } from "swr";
import { swrFetcher } from "@/src/lib/swr-fetcher";

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        // Bỏ keepPreviousData và provider globalCache để tránh tình trạng 
        // "render dữ liệu cũ rồi mới giật ra dữ liệu mới" khi chuyển trang
      }}
    >
      {children}
    </SWRConfig>
  );
};
