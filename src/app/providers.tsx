"use client";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <HeroUIProvider>
        <ToastProvider placement="top-right" maxVisibleToasts={3} toastProps={{ timeout: 5000 }} />
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  );
}
