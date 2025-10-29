"use client";

import { CSSProperties } from "react";

export function PageTitle({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <p
      className={`py-4 text-center text-xl lg:text-4xl font-bold text-inherit uppercase lg:py-8 ${className}`}
      style={style}
    >
      {children}
    </p>
  );
}
