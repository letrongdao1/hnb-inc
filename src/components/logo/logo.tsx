import React from "react";
import LIGHT_LOGO from "@/assets/logo/light.svg";
import DARK_LOGO from "@/assets/logo/dark.svg";
import { useTheme } from "next-themes";
import Image from "next/image";

export const HNBLogo = () => {
  const { theme } = useTheme();

  return (
    <Image
      src={theme === "light" ? DARK_LOGO : LIGHT_LOGO}
      alt="Logo"
      className="aspect-square w-16"
    />
  );
};

export default function LogoComponent({
  responsive,
}: {
  responsive?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <div className="flex items-center gap-2 text-inherit">
      <HNBLogo />
      <p
        className={`text-2xl font-bold text-inherit ${responsive && `hidden ${responsive}:block`}`}
      >
        HNB Hub
      </p>
    </div>
  );
}
