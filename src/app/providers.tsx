"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme-provider";
import NotificationDialog from "@/components/notification-dialog";
import { FirebaseAuthSync } from "@/hooks/firebase-auth-sync";
import { NotificationWatcher } from "@/features/notification/ui/notification-watcher";
import { ToastContainer } from "@/components/ui/custom-toast-container";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={1800}>
      <FirebaseAuthSync />
      <NotificationWatcher />

      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <NotificationDialog />
            <ToastContainer />
          </ThemeProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
