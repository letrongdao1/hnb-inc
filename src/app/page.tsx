"use client";

import HeroSection from "@/components/home/HeroSection";
import LogoComponent from "@/components/logo/logo";
import Maintenance from "@/components/maintenance";

export default function Home() {
  if (!Boolean(process.env.NEXT_PUBLIC_IS_TESTING))
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-start gap-8 px-0 py-4 font-sans sm:p-10">
        <LogoComponent />
        <p className="text-center text-5xl font-semibold">Chào mừng đến với HNB Hub!</p>

        <Maintenance showBackButton={false} />
      </div>
    );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start gap-8 px-0 py-4 font-sans sm:p-10">
      {/* <LogoComponent />
      <p className="text-center text-5xl font-semibold">Chào mừng đến với HNB Hub!</p> */}

      <HeroSection />
    </div>
  );
}
