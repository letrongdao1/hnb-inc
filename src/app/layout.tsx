import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "../providers/providers";
import ClientLayout from "./client-layout";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "HNB Hub",
  description: "A hub for HNB Inc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
