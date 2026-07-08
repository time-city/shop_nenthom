"use client";

import { SWRConfig } from "swr";
import { swrFetcher } from "@/src/lib/swr-fetcher";

// Global cache outside of the component to survive navigation in App Router
const globalCache = new Map();
const globalProvider = () => globalCache;

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        keepPreviousData: true,
        provider: globalProvider,
      }}
    >
      {children}
    </SWRConfig>
  );
};
