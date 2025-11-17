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
    <div className={`space-y-1 py-4 text-center uppercase lg:py-8 ${className}`} style={style}>
      <p className="text-xl font-bold lg:text-4xl">{children}</p>
      <p className="text-center text-xs font-light normal-case lg:text-sm">{extra}</p>
    </div>
  );
}

export function FieldErrorText({ children }: { children: React.ReactNode }) {
  return <p className={`text-sm text-red-500 italic`}>{children}</p>;
}

export function SectionTitle({
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
    <div className={`space-y-1 text-center lg:py-8 ${className}`} style={style}>
      <p className="text-start text-lg font-semibold lg:text-xl">{children}</p>
      <p className="text-tiny text-center font-light normal-case lg:text-xs">{extra}</p>
    </div>
  );
}
