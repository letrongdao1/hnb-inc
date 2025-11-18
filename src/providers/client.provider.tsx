"use client";

import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { XIcon } from "@/components/svg";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <HeroUIProvider>
        {children}
        <ToastProvider
          placement="top-right"
          maxVisibleToasts={3}
          toastProps={{
            timeout: 5000,
            closeIcon: <XIcon size={12} />,
            classNames: {
              closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
            },
          }}
        />
      </HeroUIProvider>
    </ThemeProvider>
  );
}
