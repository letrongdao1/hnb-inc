"use client";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { AuthProvider } from "./auth.provider";
import { AppStoreProvider } from "./app-store.provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        disableTransitionOnChange
      >
        <HeroUIProvider>
          <ToastProvider
            placement="top-right"
            maxVisibleToasts={3}
            toastProps={{ timeout: 5000 }}
          />
          <AuthProvider>{children}</AuthProvider>
        </HeroUIProvider>
      </ThemeProvider>
    </AppStoreProvider>
  );
}
