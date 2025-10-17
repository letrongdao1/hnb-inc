"use client";

import { CSSProperties } from "react";

export function PageTitle({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <p className="uppercase text-4xl font-bold text-inherit text-center py-4 lg:py-8" style={style}>
      {children}
    </p>
  );
}
