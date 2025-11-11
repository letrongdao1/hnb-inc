"use client";

import { CSSProperties } from "react";

export function PageTitle({
  children,
  extra,
  style,
  className,
}: {
  children: React.ReactNode;
  extra?: string | React.ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`space-y-1 py-4 text-center text-inherit uppercase lg:py-8 ${className}`}
      style={style}
    >
      <p className="text-xl font-bold lg:text-4xl">{children}</p>
      <p className="text-center text-xs font-light normal-case lg:text-sm">{extra}</p>
    </div>
  );
}

export function FieldErrorText({ children }: { children: React.ReactNode }) {
  return <p className={`text-sm text-red-500 italic`}>{children}</p>;
}
