import "./globals.css";
import type { Metadata } from "next";
import { Alfa_Slab_One, Be_Vietnam_Pro, Montserrat } from "next/font/google";
import { ClientProviders } from "../providers/client.providers";
import ClientLayout from "./client-layout";
import { getCurrentUserInfo } from "./auth/actions";
import { cache } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const alfaSlabOne = Alfa_Slab_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-alfaSlabOne",
});

export const metadata: Metadata = {
  title: "HNB Hub",
  description: "A hub for HNB Inc.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userData = await cache(async () => {
    return await getCurrentUserInfo();
  })();

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${alfaSlabOne.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans dark text-foreground bg-background">
        <ClientProviders>
          <ClientLayout user={userData}>{children}</ClientLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
