"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import NotificationDialog from "@/components/notification-dialog";
import { SocketProvider } from "@/lib/realtime/socket-context";
import NewVoucherPopup from "@/components/new-voucher-popup";
import UnluckyVoucherPopup from "@/components/unlucky-voucher-popup";
import EventParticipationPopup from "@/components/event-participation-popup";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={1800}>
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              forcedTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <NotificationDialog />
              <NewVoucherPopup />
              <UnluckyVoucherPopup />
              <Suspense>
                <EventParticipationPopup />
              </Suspense>
            </ThemeProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
