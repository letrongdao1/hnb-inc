import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ClientProviders } from "../providers/client.providers";
import ClientLayout from "./client-layout";
import { getCurrentUserInfo } from "./auth/actions";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "HNB Hub",
  description: "A hub for HNB Inc.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userData = await getCurrentUserInfo();

  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ClientProviders>
          <ClientLayout user={userData}>{children}</ClientLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
