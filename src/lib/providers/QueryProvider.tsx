"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: false },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient =
    typeof window === "undefined"
      ? createQueryClient()
      : (browserQueryClient ??= createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
