import "./globals.css";
import type { Metadata } from "next";
import { Alfa_Slab_One, Montserrat } from "next/font/google";
import { ClientProviders } from "../providers/client.provider";
import ClientLayout from "./client-layout";
import { getCurrentUserInfo } from "./auth/actions";
import { cache, Suspense } from "react";
import Loader from "@/components/loader";

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
  description: "A platform belonging to HNB for customized contents, shared assets and connectivity.",
  openGraph: {
    title: "HNB Hub",
    description: "A platform belonging to HNB for customized contents, shared assets and connectivity.",
    url: "https://hnb-inc.site",
    siteName: "HNB Hub",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
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
      <body className="text-foreground bg-background font-sans">
        <ClientProviders>
          <ClientLayout user={userData}>
            <Suspense fallback={<Loader />}>{children}</Suspense>
          </ClientLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
