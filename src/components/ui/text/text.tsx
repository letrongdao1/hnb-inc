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
      className={`py-4 text-center text-xl font-bold text-inherit uppercase lg:py-8 lg:text-4xl ${className}`}
      style={style}
    >
      {children}
    </p>
  );
}

export function FieldErrorText({ children }: { children: React.ReactNode }) {
  return <p className={`text-sm text-red-500 italic`}>{children}</p>;
}
