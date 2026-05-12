"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import NotificationDialog from "@/components/notification-dialog";
import { FirebaseAuthSync } from "@/hooks/firebase-auth-sync";
import { NotificationWatcher } from "@/features/notification/ui/notification-watcher";
import { ToastContainer } from "@/components/ui/custom-toast-container";
import NewVoucherPopup from "@/components/new-voucher-popup";
import EventParticipationPopup from "@/components/event-participation-popup";
import { Toaster } from "sonner";

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
            <NewVoucherPopup />
            <Suspense>
              <EventParticipationPopup />
            </Suspense>
            <ToastContainer />
            <Toaster 
              position="bottom-right" 
              richColors 
              toastOptions={{
                className: "max-w-[90vw] sm:max-w-[350px]",
                style: {
                  width: "auto",
                }
              }}
            />
          </ThemeProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
